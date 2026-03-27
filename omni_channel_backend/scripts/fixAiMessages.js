require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('../src/models/Message');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const result = await Message.updateMany(
      { senderType: 'ai' },
      { $set: { 'metadata.isAiSuggestion': true } }
    );

    console.log(`Updated ${result.modifiedCount} AI messages.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
