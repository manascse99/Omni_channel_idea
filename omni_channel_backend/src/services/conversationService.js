const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const identityService = require('./identityService');
const aiService = require('./aiService');

/**
 * Handles saving incoming messages and updating the unified conversation thread.
 * Refactored to use AI for metrics (intent, sentiment) but keep messaging manual.
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
        const result = { conversation, newMessage: existing };
        // 3. Emit Socket event for real-time dashboard update (including AI metrics)
        if (req.socketService) {
          req.socketService.emitAiResults(result.conversation, result.newMessage, {
            content: result.aiResult?.reply || ''
          });
        }
        return result;
      }
    }

    // 2. Find or create the ONE unified conversation for this user
    let conversation = await Conversation.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { status: 'open', lastChannel: channel } },
      { upsert: true, new: true, runValidators: true }
    );

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

    // 4. Run AI Analysis for Metrics (Silent)
    // Fetch recent conversation history for AI context
    const recentMessages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: 1 })
      .limit(10);

    const aiResult = await aiService.processMessage(content, recentMessages);

    // 5. Update Conversation metadata with AI results (For Analytics/Monitor)
    conversation.intent = aiResult.intent || 'general';
    conversation.sentiment = aiResult.sentiment || 'neutral';
    conversation.aiConfidence = aiResult.confidence || 80;
    conversation.aiSummary = aiResult.summary || null;
    conversation.lastMessage = content.substring(0, 100);
    conversation.lastChannel = channel;
    conversation.updatedAt = new Date();
    
    // Ensure status is open for agent attention
    if (conversation.status === 'resolved' || conversation.status === 'ai-handling') {
      conversation.status = 'open';
    }
    
    // Reset notification state for persistence
    conversation.isRead = false;

    await conversation.save();

    console.log(`[CONVERSATION] AI metrics updated. Message processed for user ${user.email || user.phone}. Status: ${conversation.status}`);

    return { conversation, newMessage, aiResult };

  } catch (error) {
    console.error("Conversation Service Error:", error);
    throw error;
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
  isDuplicateWhatsAppMessage
};
