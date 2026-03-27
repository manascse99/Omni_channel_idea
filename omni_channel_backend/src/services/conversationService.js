const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const aiService = require('./aiService');

/**
 * Handles saving incoming messages, running them through AI, 
 * and updating the unified conversation thread.
 */
async function processIncomingMessage(user, channel, content, metadata = {}) {
  try {
    // 1. Find or create the unified conversation for this user
    let conversation = await Conversation.findOne({ userId: user._id });

    if (!conversation) {
      conversation = await Conversation.create({
        userId: user._id,
        status: 'open',
        lastChannel: channel
      });
    }

    // 2. Save the customer's message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      userId: user._id,
      channel: channel,
      senderType: 'user',
      content: content,
      isRead: false,
      metadata: metadata // Contains whatsappMsgId for deduplication etc
    });

    // 3. Fetch recent conversation history for AI context
    const recentMessages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: 1 })
      .limit(10); // Last 10 messages for context

    // 4. Run AI Pipeline (Parallel)
    const aiResult = await aiService.processMessage(content, recentMessages);

    // 5. Update Conversation with AI findings
    conversation.intent = aiResult.intent || 'general';
    conversation.sentiment = aiResult.sentiment || 'neutral';
    conversation.aiSummary = aiResult.summary || null;
    conversation.lastMessage = content.substring(0, 100);
    conversation.lastChannel = channel;
    conversation.updatedAt = new Date();
    
    // Optionally move status to AI-Handling
    if (conversation.status === 'open') {
      conversation.status = 'ai-handling';
    }

    await conversation.save();

    return { conversation, aiResult, newMessage };

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
