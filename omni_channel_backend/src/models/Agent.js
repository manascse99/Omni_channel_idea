const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'supervisor'],
    default: 'agent'
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  status: {
    type: String,
    enum: ['online', 'busy', 'offline'],
    default: 'offline'
  },
  activeChats: {
    type: Number,
    default: 0
  },
  resolvedToday: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    default: 'OMNI AI Platform Agent'
  },
  location: {
    type: String,
    default: 'Remote'
  },
  department: {
    type: String,
    default: 'Customer Experience'
  },
  timezone: {
    type: String,
    default: 'IST (UTC+5:30)'
  }
}, { timestamps: true });

// Custom Indexes
agentSchema.index({ teamId: 1 });
agentSchema.index({ status: 1 });

module.exports = mongoose.model('Agent', agentSchema);
