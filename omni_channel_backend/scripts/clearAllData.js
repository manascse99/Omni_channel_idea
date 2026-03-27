require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('../src/models/Message');
const Conversation = require('../src/models/Conversation');
const User = require('../src/models/User');

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all messages and conversations
    const msgRes = await Message.deleteMany({});
    const convRes = await Conversation.deleteMany({});
    
    // Optional: Reset user channel history but keep users?
    // User wants ALL data before today removed.
    // I'll keep the users but clear their conversations.
    
    console.log(`Deleted ${msgRes.deletedCount} messages`);
    console.log(`Deleted ${convRes.deletedCount} conversations`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
}

clearData();
