const mongoose = require('mongoose');
const User = require('./src/models/User');
const Conversation = require('./src/models/Conversation');
require('dotenv').config();

async function checkDuplicates() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const users = await User.find({ name: /Manas Srivastava/i });
  console.log(`Found ${users.length} users matching "Manas Srivastava":`);
  for (const user of users) {
    console.log(`- ID: ${user._id}, Name: ${user.name}, Email: ${user.email}, Phone: ${user.phone}`);
    const conv = await Conversation.findOne({ userId: user._id });
    if (conv) {
      console.log(`  - Has Conversation: ${conv._id}, Last Message: ${conv.lastMessage}, Last Channel: ${conv.lastChannel}`);
    } else {
      console.log(`  - No Conversation found for this user ID.`);
    }
  }

  const raoUsers = await User.find({ name: /Rao Sahab/i });
  console.log(`\nFound ${raoUsers.length} users matching "Rao Sahab":`);
  for (const user of raoUsers) {
    console.log(`- ID: ${user._id}, Name: ${user.name}, Email: ${user.email}, Phone: ${user.phone}`);
    const conv = await Conversation.findOne({ userId: user._id });
    if (conv) {
      console.log(`  - Has Conversation: ${conv._id}, Last Message: ${conv.lastMessage}, Last Channel: ${conv.lastChannel}`);
    } else {
      console.log(`  - No Conversation found for this user ID.`);
    }
  }

  process.exit(0);
}

checkDuplicates();
