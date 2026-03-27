const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  intentMapping: [{
    type: String
  }],
  activeConversations: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Custom Index
teamSchema.index({ intentMapping: 1 });

module.exports = mongoose.model('Team', teamSchema);
