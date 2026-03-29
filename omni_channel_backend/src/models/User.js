const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    sparse: true,
    unique: true
  },
  email: {
    type: String,
    sparse: true,
    unique: true
  },
  telegramChatId: {
    type: String,
    sparse: true,
    unique: true
  },
  discordUserId: {
    type: String,
    sparse: true,
    unique: true
  },
  name: {
    type: String,
    default: null
  },
  channelHistory: [{
    type: String,
    enum: ['whatsapp', 'email', 'webchat', 'telegram', 'discord']
  }],
  preferredChannel: {
    type: String,
    enum: ['whatsapp', 'email', 'webchat', 'telegram', 'discord'],
    default: 'whatsapp'
  },
  duplicateWarning: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  lastSeen: {
    type: Date,
    default: Date.now
  },
  lastChannel: {
    type: String
  },
  firstInteractionAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Custom index for sorting
userSchema.index({ lastSeen: -1 });

module.exports = mongoose.model('User', userSchema);
