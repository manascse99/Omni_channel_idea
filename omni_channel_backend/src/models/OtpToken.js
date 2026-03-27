const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Custom Indexes
otpTokenSchema.index({ agentId: 1 });
otpTokenSchema.index({ email: 1 });
otpTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 }); // TTL: auto-deletes after 5 min

module.exports = mongoose.model('OtpToken', otpTokenSchema);

