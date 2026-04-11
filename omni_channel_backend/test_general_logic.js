const mongoose = require('mongoose');
const identityService = require('./src/services/identityService');
const User = require('./src/models/User');
require('dotenv').config();

async function testGeneralLogic() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // 1. Test Duplicate Name Flagging
  console.log('\n--- Testing Name Conflict Flagging ---');
  // Existing user "Manas Srivastava" exists. Let's try to create another one from a new channel.
  const { user: newUser, isNew } = await identityService.resolveIdentity('whatsapp', '9876543210', 'Manas Srivastava');
  console.log(`New User Created: ${newUser._id}`);
  console.log(`duplicateWarning: ${newUser.duplicateWarning}`);
  
  if (newUser.duplicateWarning === true) {
    console.log('SUCCESS: Name conflict correctly flagged.');
  } else {
    console.log('FAILURE: Name conflict NOT flagged.');
  }

  // 2. Test Regex Auto-Merging
  // We'll simulate a message from this new user containing the email of the master Manas profile.
  console.log('\n--- Testing Regex Auto-Merging ---');
  const conversationService = require('./src/services/conversationService');
  const masterEmail = 'manascse99@gmail.com';
  
  console.log(`Simulating message from ${newUser._id} mentioning ${masterEmail}...`);
  const result = await conversationService.processIncomingMessage(newUser, 'whatsapp', `My primary email is ${masterEmail}`);
  
  // Check if the user ID for the conversation was updated to the master user
  const updatedConv = result.conversation;
  const masterUser = await User.findOne({ email: masterEmail });
  
  console.log(`Conversation UserId: ${updatedConv.userId}`);
  console.log(`Master UserId: ${masterUser._id}`);
  
  if (updatedConv.userId.toString() === masterUser._id.toString()) {
    console.log('SUCCESS: Regex pass auto-merged the identities.');
  } else {
    console.log('FAILURE: Regex pass did NOT merge identities.');
  }

  // Cleanup the test user
  await User.deleteOne({ _id: newUser._id });
  console.log('\nCleanup complete.');
  process.exit(0);
}

testGeneralLogic();
