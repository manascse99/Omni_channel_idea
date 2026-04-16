const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  ai: {
    model: { type: String, default: 'llama3' },
    autoReply: { type: Boolean, default: true },
    autoEscalate: { type: Boolean, default: true },
    sentimentAnalysis: { type: Boolean, default: true },
    confidenceThreshold: { type: Number, default: 85 },
    intents: [{
      intent: String,
      module: String,
      active: Boolean
    }]
  },
  branding: {
    primaryColor: { type: String, default: '#00CCA3' },
    companyName: { type: String, default: 'OmniBank AI' },
    logoUrl: { type: String, default: '' }
  },
  channels: {
    whatsapp: { enabled: { type: Boolean, default: true } },
    email: { enabled: { type: Boolean, default: true } },
    webchat: { enabled: { type: Boolean, default: true } }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
