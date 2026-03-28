const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  body: { type: String, required: true },
  channel: { type: String, enum: ['email', 'telegram'], default: 'email' },
  recipientType: { type: String, enum: ['all', 'filtered'], default: 'all' },
  filter: { type: Object, default: {} }, // e.g. { channel: 'email' }
  scheduledAt: { type: Date, default: null }, // null = send immediately
  status: {
    type: String,
    enum: ['queued', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'queued'
  },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  sentAt: { type: Date, default: null },
  error: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Broadcast', broadcastSchema);
