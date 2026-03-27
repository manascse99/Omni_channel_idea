const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const aiService = require('./aiService');
const emailService = require('./emailService');

/**
 * Handles saving incoming messages, running them through AI, 
 * and updating the unified conversation thread.
 */
async function processIncomingMessage(user, channel, content, metadata = {}) {
  try {
    // 0. Check for IMAP deduplication if UID is provided
    if (metadata.imapUid) {
      const existing = await Message.findOne({ 'metadata.imapUid': metadata.imapUid });
      if (existing) {
        console.log(`IMAP: Skipping already stored message [UID: ${metadata.imapUid}]`);
        return { conversation: await Conversation.findById(existing.conversationId), newMessage: existing, aiMessage: existing };
      }
    }

    // 1. Find or create the ONE unified conversation for this user
    let conversation = await Conversation.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { status: 'open', lastChannel: channel } },
      { upsert: true, new: true, runValidators: true }
    );

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

    // 5. Save the AI suggested reply as a message (senderType: 'ai')
    const aiMessage = await Message.create({
      conversationId: conversation._id,
      userId: user._id,
      channel: channel,
      senderType: 'ai',
      content: aiResult.reply,
      isRead: true, // Internal/Suggestion
      metadata: { ...metadata, isAiSuggestion: true }
    });

    // 6. Update Conversation with AI findings
    conversation.intent = aiResult.intent || 'general';
    conversation.sentiment = aiResult.sentiment || 'neutral';
    conversation.aiConfidence = aiResult.confidence || 80;
    conversation.aiSummary = aiResult.summary || null;
    conversation.lastMessage = content.substring(0, 100);
    conversation.lastChannel = channel;
    conversation.updatedAt = new Date();
    
    // Optionally move status to AI-Handling
    if (conversation.status === 'open') {
      conversation.status = 'ai-handling';
    }

    await conversation.save();

    // 7. Automated Channel-Specific Actions (Email)
    if (channel === 'email' && user.email) {
      console.log(`[EMAIL] Auto-replying to ${user.email} (MessageId: ${metadata.messageId})`);
      try {
        await emailService.sendReply(
          user.email,
          aiResult.reply,
          metadata.emailSubject || 'Re: Message Received',
          metadata.messageId
        );
      } catch (emailErr) {
        console.error('[EMAIL] Auto-reply failed:', emailErr.message);
      }
    } else if (channel === 'email') {
      console.warn(`[EMAIL] Skipping auto-reply: No user email found.`);
    }

    return { conversation, aiResult, newMessage, aiMessage };

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
