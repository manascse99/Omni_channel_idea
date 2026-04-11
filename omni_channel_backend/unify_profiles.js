const mongoose = require('mongoose');
const identityService = require('./src/services/identityService');
require('dotenv').config();

async function runCleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const primaryId = '69d7ec5f2fd0ee4196d1ab8a'; // Manas Srivastava (manascse99@gmail.com)
    const dup1Id = '69c6bc920ebe042af339202d';    // MANAS SRIVASTAVA (manas.2428csit2032@kiet.edu)
    const dup2Id = '69c80ca97d27c638aa825903';    // Rao Sahab (manasce99@gmail.com)

    console.log('\n--- Merging Duplicate 1: MANAS SRIVASTAVA ---');
    await identityService.mergeUsers(primaryId, dup1Id);
    console.log('Success: Merged MANAS SRIVASTAVA');

    console.log('\n--- Merging Duplicate 2: Rao Sahab ---');
    await identityService.mergeUsers(primaryId, dup2Id);
    console.log('Success: Merged Rao Sahab');

    console.log('\n--- FINAL VERIFICATION ---');
    const User = require('./src/models/User');
    const finalUser = await User.findById(primaryId);
    console.log('Combined Identifiers:');
    console.log(`- Name: ${finalUser.name}`);
    console.log(`- Email: ${finalUser.email}`);
    console.log(`- Telegram: ${finalUser.telegramChatId}`);
    console.log(`- History: ${finalUser.channelHistory.join(', ')}`);

    process.exit(0);
  } catch (err) {
    console.error('FAILED:', err);
    process.exit(1);
  }
}

runCleanup();
