const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['open', 'ai-handling', 'pending-review', 'escalated', 'resolved'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  intent: {
    type: String,
    default: null
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  lastMessage: {
    type: String
  },
  lastChannel: {
    type: String,
    enum: ['whatsapp', 'email', 'webchat', 'telegram']
  },
  aiSummary: {
    type: String,
    default: null
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  aiConfidence: {
    type: Number,
    default: 0
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Custom Indexes
conversationSchema.index({ status: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ assignedTo: 1 });
conversationSchema.index({ assignedTeam: 1 });
conversationSchema.index({ intent: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
