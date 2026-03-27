const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'email', 'webchat'],
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'agent', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    whatsappMsgId: {
      type: String,
      default: null
    },
    emailSubject: {
      type: String,
      default: null
    },
    emailMessageId: {
      type: String,
      default: null
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null
    }
  }
});

// Custom Indexes
messageSchema.index({ conversationId: 1, timestamp: 1 });
messageSchema.index({ conversationId: 1, isRead: 1 });
messageSchema.index({ 'metadata.whatsappMsgId': 1 }, { sparse: true });
messageSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);
