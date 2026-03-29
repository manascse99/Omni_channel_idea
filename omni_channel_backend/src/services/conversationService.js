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

    // 1. Check for IMAP deduplication if UID is provided
    if (metadata.imapUid) {
      const existing = await Message.findOne({ 'metadata.imapUid': metadata.imapUid });
      if (existing) {
        console.log(`IMAP: Skipping already stored message [UID: ${metadata.imapUid}]`);
        const conversation = await Conversation.findById(existing.conversationId);
        return { conversation, newMessage: existing, alreadyProcessed: true };
      }
    }

    // 2. Find or create the ONE unified conversation for this user
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

    // Ensure status is open for agent attention
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

    // 4. Create Formal Notification for Dashboard (Instant)
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

    console.log(`[CONVERSATION] Message saved (FAST) for user ${user.email || user.phone}. Ingestion complete.`);

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
