const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const axios = require('axios');
const identityService = require('./identityService');
const aiService = require('./aiService');
const emailService = require('./emailService');

/**
 * Handles saving incoming messages and updating the unified conversation thread.
 * Refactored to separate message saving (FAST) from AI analysis (SLOW).
 */
async function processIncomingMessage(userOrData, channel, content, metadata = {}) {
  try {
    // 0. Resolve User Identity if not already a Mongoose object
    let user;
    if (userOrData._id) {
      user = userOrData;
    } else {
      const { user: resolvedUser } = await identityService.resolveIdentity(channel, userOrData.email || userOrData.phone, userOrData.name);
      user = resolvedUser;
    }

    // --- CRITICAL FIX: Early Identity Pass (Pre-Thread Creation) ---
    // If we can identify the user early, we avoid creating a "ghost" conversation altogether.
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const phoneRegex = /(\+?\d{10,13})/;
    const emailMatch = content.match(emailRegex);
    const phoneMatch = content.match(phoneRegex);

    if (emailMatch || phoneMatch) {
      console.log(`[CONVERSATION] Identity detected early. Running pre-link...`);
      try {
        const identifier = emailMatch ? emailMatch[0].toLowerCase() : phoneMatch[0];
        const type = emailMatch ? 'email' : 'phone';
        const { masterUser, deletedConversationId } = await identityService.linkIdentity(user._id, identifier, type);
        
        if (masterUser) {
          user = masterUser;
          // Store deletedConversationId if it exists to help the caller notify the UI
          metadata.deletedConversationId = deletedConversationId;
        }
      } catch (linkErr) {
        console.error('[CONVERSATION] Early link failed:', linkErr.message);
      }
    }

    // 1. Check for IMAP deduplication
    if (metadata.imapUid) {
      const existing = await Message.findOne({ 'metadata.imapUid': metadata.imapUid });
      if (existing) {
        const conversation = await Conversation.findById(existing.conversationId);
        return { conversation, newMessage: existing, alreadyProcessed: true };
      }
    }

    // 2. Find or create the ONE unified conversation for the final (Master) user
    let conversation = await Conversation.findOneAndUpdate(
      { userId: user._id },
      { 
        $setOnInsert: { status: 'open' },
        $set: { 
          lastMessage: content.substring(0, 100),
          lastChannel: channel,
          updatedAt: new Date(),
          isRead: false
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    if (conversation.status === 'resolved' || conversation.status === 'ai-handling') {
      conversation.status = 'open';
      await conversation.save();
    }

    // 3. Save the customer's message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      userId: user._id,
      channel: channel,
      senderType: 'user',
      content: content,
      isRead: false,
      metadata: metadata 
    });

    // 4. Create Formal Notification
    try {
      await Notification.create({
        title: 'New Message Received',
        description: `Message from ${user.name || user.email || channel.toUpperCase()} via ${channel.toUpperCase()}`,
        type: channel === 'escalated' ? 'escalation' : 'conversation',
        link: `/conversations/${conversation._id}`,
        userId: user._id,
        conversationId: conversation._id
      });
    } catch (notifyErr) {
      console.error("[NOTIFICATION] Failed to create alert:", notifyErr);
    }

    return { conversation, newMessage, user };

  } catch (error) {
    console.error("Conversation Service Error:", error);
    throw error;
  }
}

/**
 * Runs the time-consuming Gemini AI Analysis and updates conversation metrics.
 * Designed to be run in the background.
 */
async function applyAiAnalysis(conversationId, messageId, content, socketService = null) {
  try {
    console.log(`[AI-BACKGROUND] Starting Gemini analysis for message ${messageId}...`);
    
    // 1. Fetch Context: Message History, User Profile, and Conversation
    const [conversation, recentMessages, user] = await Promise.all([
      Conversation.findById(conversationId),
      Message.find({ conversationId }).sort({ timestamp: 1 }).limit(10).lean(),
      Conversation.findById(conversationId).populate('userId').then(c => c.userId)
    ]);

    if (!conversation || !user) return;

    // 2. Prepare Gemini Input Payload (Following PART 1 - INPUT FORMAT)
    const geminiInput = {
      customerMessage: content,
      channel: conversation.lastChannel,
      conversationHistory: recentMessages.map(m => ({
        role: m.senderType === 'user' ? 'user' : m.senderType === 'agent' ? 'agent' : 'ai',
        content: m.content,
        timestamp: m.timestamp
      })),
      customerProfile: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        channelHistory: user.channelHistory,
        tags: user.tags,
        risk_score: user.riskScore || 0,
        previous_summary: conversation.aiSummary
      },
      agentContext: {
        assigned_agent: conversation.assignedTo,
        assigned_team: conversation.assignedTeam
      }
    };

    // 3. Call Gemini
    const aiResponse = await aiService.processMessageWithGemini(geminiInput);
    const ai = aiResponse.data;

    // 4. Update Conversation with AI results (Intent, Sentiment, Summary, Routing, Suggested Replies)
    conversation.intent = ai.intent;
    conversation.sentiment = ai.sentiment;
    conversation.aiConfidence = ai.intent_confidence;
    conversation.aiSummary = ai.conversation_summary;
    
    // Explicitly set array and mark modified to ensure Mongoose persists it
    conversation.suggestedReplies = Array.isArray(ai.suggested_quick_replies) ? [...ai.suggested_quick_replies] : [];
    conversation.markModified('suggestedReplies');

    conversation.processingNotes = ai.processing_notes || null;
    conversation.escalationReason = ai.escalation_reason || null;
    
    console.log(`[AI-DEBUG] Suggestions to save: ${JSON.stringify(conversation.suggestedReplies)}`);
    
    // Auto-routing if unassigned (Mapping Gemini teams to DB teams)
    if (!conversation.assignedTeam && ai.team_routing?.length > 0) {
      const Team = require('../models/Team');
      const teamMapper = {
        'loans_team': 'Sales Team',
        'grievance_team': 'Fraud & Alerts',
        'general_support': 'Customer Support',
        'security_team': 'Fraud & Alerts'
      };
      
      const targetTeamName = teamMapper[ai.team_routing[0]] || ai.team_routing[0].replace('_', ' ');
      const team = await Team.findOne({ name: new RegExp(targetTeamName, 'i') });
      if (team) {
        conversation.assignedTeam = team._id;
        console.log(`[AI-ROUTING] Routed to team: ${team.name}`);
      }
    }

    // Handle AI-driven escalation
    if (ai.should_escalate) {
      conversation.status = 'escalated';
    } else {
      conversation.status = 'ai-handling';
    }

    await conversation.save();

    // 5. Update User Risk Score with history and capping
    if (ai.risk_delta !== 0) {
      const User = require('../models/User');
      const currentUser = await User.findById(user._id);
      if (currentUser) {
        let newScore = (currentUser.riskScore || 0) + ai.risk_delta;
        
        // Cap between 0 and 100
        newScore = Math.max(0, Math.min(100, newScore));
        
        currentUser.riskScore = newScore;
        currentUser.riskHistory.push({
          score: newScore,
          delta: ai.risk_delta,
          reason: ai.risk_reason || "AI analysis update",
          timestamp: new Date()
        });
        
        // Keep only last 20 history entries to prevent document bloating
        if (currentUser.riskHistory.length > 20) {
          currentUser.riskHistory.shift();
        }
        
        await currentUser.save();
        console.log(`[AI-BACKGROUND] Risk Score updated for ${user.email || user.phone}: ${newScore} (Delta: ${ai.risk_delta})`);
      }
    }

    // 6. Handle Identity Extraction (TASK 6)
    const identity = ai.extracted_identity;
    if (identity && (identity.phone_number || identity.email)) {
      try {
        if (identity.email && identity.email.includes('@')) {
          await identityService.linkIdentity(user._id, identity.email.toLowerCase(), 'email');
        }
        if (identity.phone_number && /^\+?\d{10,13}$/.test(identity.phone_number)) {
          await identityService.linkIdentity(user._id, identity.phone_number, 'phone');
        }
      } catch (linkErr) {
        console.error('[AI-BACKGROUND] Identity link failed:', linkErr.message);
      }
    }

    // 7. Save AI Reply as a Message (Following PART 2 - STEP 7)
    const aiMessage = await Message.create({
      conversationId: conversation._id,
      userId: user._id,
      channel: conversation.lastChannel,
      senderType: 'ai',
      content: ai.reply,
      isRead: false,
      timestamp: new Date()
    });

    console.log(`[AI-BACKGROUND] Analysis complete. Intent: ${ai.intent}, Sentiment: ${ai.sentiment}`);

    // 8. Push real-time update to dashboard
    if (socketService) {
      socketService.emitAiResults(conversation, aiMessage);
    }

    // 9. PERFORM REAL-WORLD DELIVERY (New Step)
    await sendOutboundMessage(conversation, ai.reply);

    return ai;
  } catch (error) {
    console.error("[AI-BACKGROUND] Gemini analysis failed:", error);
  }
}

/**
 * Centralized logic for sending outbound messages to customers via their original channel.
 * Supporting Telegram, Email, and Discord.
 */
async function sendOutboundMessage(conversation, content, metadata = {}) {
  try {
    const channel = conversation.lastChannel;
    let user = conversation.userId && conversation.userId._id ? conversation.userId : null;
    
    if (!user) {
      const User = require('../models/User');
      user = await User.findById(conversation.userId);
    }

    if (!user) {
      console.warn(`[OUTBOUND] Cannot deliver message to conversation ${conversation._id}: User not found.`);
      return;
    }

    console.log(`[OUTBOUND] Delivering message to ${user.email || user.phone || 'User'} via ${channel}...`);

    // --- TELEGRAM DELIVERY ---
    if (channel === 'telegram') {
      if (!user.telegramChatId) {
        console.error(`[TELEGRAM] Delivery failed: No telegramChatId for user ${user._id}`);
        return;
      }
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        console.error('[TELEGRAM] Bot token missing from env. Skipping delivery.');
        return;
      }
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: user.telegramChatId,
        text: content
      });
      console.log(`[TELEGRAM] Message successfully delivered to chatId ${user.telegramChatId}`);
    } 

    // --- EMAIL DELIVERY ---
    else if (channel === 'email' && user.email) {
      // 1. Try to find threading context
      const lastUserMsg = await Message.findOne({
        conversationId: conversation._id,
        senderType: 'user'
      }).sort({ timestamp: -1 });

      const subject = lastUserMsg?.metadata?.emailSubject || 'Re: Message Received from OmniBank';
      const messageId = lastUserMsg?.metadata?.messageId;

      if (messageId) {
        // Option A: Send as a Threaded Reply
        await emailService.sendReply(user.email, content, subject, messageId);
        console.log(`[EMAIL] Threaded reply delivered to ${user.email}`);
      } else {
        // Option B: Fallback - Send as a standard Email (Better than skipping!)
        console.log(`[EMAIL] No threading metadata found. Falling back to standard send for ${user.email}.`);
        await emailService.transporter.sendMail({
          from: `"OmniBank AI" <${process.env.GMAIL_USER}>`,
          to: user.email,
          subject: subject.startsWith('Re:') ? subject : `Project OmniBank Update: ${subject}`,
          text: content
        });
        console.log(`[EMAIL] Standard email delivered to ${user.email}`);
      }
    }

    // --- DISCORD DELIVERY ---
    else if (channel === 'discord') {
      if (!user.discordUserId) {
        console.error(`[DISCORD] Delivery failed: No discordUserId for user ${user._id}`);
        return;
      }
      const lastDiscordMsg = await Message.findOne({
        conversationId: conversation._id,
        channel: 'discord',
        senderType: 'user'
      }).sort({ timestamp: -1 });

      const targetChannelId = lastDiscordMsg?.metadata?.channelId;

      if (targetChannelId) {
        const globalRegistry = require('../utils/globalRegistry'); 
        const discordService = globalRegistry.get('discordService');
        if (discordService) {
          await discordService.sendDiscordMessage(targetChannelId, content);
          console.log(`[DISCORD] Message delivered to channelId ${targetChannelId}`);
        } else {
          console.error('[DISCORD] Delivery failed: discordService not available in registry.');
        }
      } else {
        console.warn(`[DISCORD] Delivery failed: No channelId found for conversation ${conversation._id}`);
      }
    }

    else if (channel === 'whatsapp') {
      console.log(`[WHATSAPP] Outbound skipped: WhatsApp persists in DB but automated delivery is disabled (Meta Apps not in use).`);
    }

    else {
      console.log(`[OUTBOUND] Channel '${channel}' is recognized but delivery logic is missing or identifiers are undefined.`);
    }

  } catch (error) {
    console.error(`[OUTBOUND] Delivery failed for channel ${conversation.lastChannel}:`, error.message);
  }
}

/**
 * Ensures WhatsApp deduplication before processing
 */
async function isDuplicateWhatsAppMessage(whatsappMsgId) {
  if (!whatsappMsgId) return false;
  const exists = await Message.findOne({ 'metadata.whatsappMsgId': whatsappMsgId });
  return !!exists;
}

module.exports = {
  processIncomingMessage,
  applyAiAnalysis,
  sendOutboundMessage,
  isDuplicateWhatsAppMessage
};
