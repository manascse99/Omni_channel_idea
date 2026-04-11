const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const identityService = require('./identityService');
const aiService = require('./aiService');

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
 * Runs the time-consuming AI Analysis (Ollama) and updates conversation metrics.
 * Designed to be run in the background.
 */
async function applyAiAnalysis(conversationId, messageId, content, socketService = null) {
  try {
    console.log(`[AI-BACKGROUND] Starting analysis for message ${messageId}...`);
    
    // Fetch recent conversation history for AI context
    const recentMessages = await Message.find({ conversationId: conversationId })
      .sort({ timestamp: 1 })
      .limit(10);

    const aiResult = await aiService.processMessage(content, recentMessages);

    // Update Conversation metadata with AI results (For Analytics/Monitor)
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    conversation.intent = aiResult.intent || 'general';
    conversation.sentiment = aiResult.sentiment || 'neutral';
    conversation.aiConfidence = aiResult.confidence || 80;
    conversation.aiSummary = aiResult.summary || null;
    await conversation.save();

    // -- AI AUTO-LINKING --
    if (aiResult.extractedContacts) {
      try {
        if (aiResult.extractedContacts.email && aiResult.extractedContacts.email.includes('@')) {
          const mergedUser = await identityService.linkIdentity(conversation.userId, aiResult.extractedContacts.email, 'email');
          if (mergedUser) {
            conversation.userId = mergedUser._id; // Update in memory if merged
            console.log(`[AI-BACKGROUND] Extracted and auto-linked email: ${aiResult.extractedContacts.email}`);
          }
        }
        if (aiResult.extractedContacts.phone && /\\d{7,}/.test(aiResult.extractedContacts.phone)) {
          const mergedUser = await identityService.linkIdentity(conversation.userId, aiResult.extractedContacts.phone, 'phone');
          if (mergedUser) {
            conversation.userId = mergedUser._id;
            console.log(`[AI-BACKGROUND] Extracted and auto-linked phone: ${aiResult.extractedContacts.phone}`);
          }
        }
      } catch (linkErr) {
        console.error('[AI-BACKGROUND] Failed to auto-link identity:', linkErr);
      }
    }

    console.log(`[AI-BACKGROUND] Analysis complete for message ${messageId}. Intent: ${conversation.intent}`);

    // If socketService is provided, notify the dashboard of the updated metrics
    if (socketService) {
      const message = await Message.findById(messageId);
      socketService.emitAiResults(conversation, message, {
        content: aiResult?.reply || ''
      });
    }

    return aiResult;
  } catch (error) {
    console.error("[AI-BACKGROUND] Analysis failed:", error);
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
  isDuplicateWhatsAppMessage
};
