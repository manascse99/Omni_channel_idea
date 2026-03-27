require('dotenv').config();
const mongoose = require('mongoose');

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'omni_channel_ai' });
    const db = mongoose.connection.db;

    console.log('Building indexes...');

    // users
    await db.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ lastSeen: -1 });

    // conversations
    await db.collection('conversations').createIndex({ userId: 1 }, { unique: true });
    await db.collection('conversations').createIndex({ status: 1 });
    await db.collection('conversations').createIndex({ updatedAt: -1 });
    await db.collection('conversations').createIndex({ assignedTo: 1 });
    await db.collection('conversations').createIndex({ assignedTeam: 1 });
    await db.collection('conversations').createIndex({ intent: 1 });

    // messages
    await db.collection('messages').createIndex({ conversationId: 1, timestamp: 1 });
    await db.collection('messages').createIndex({ conversationId: 1, isRead: 1 });
    await db.collection('messages').createIndex({ 'metadata.whatsappMsgId': 1 }, { sparse: true });
    await db.collection('messages').createIndex({ timestamp: -1 });

    // agents
    await db.collection('agents').createIndex({ phone: 1 }, { unique: true });
    await db.collection('agents').createIndex({ email: 1 }, { unique: true });
    await db.collection('agents').createIndex({ teamId: 1 });
    await db.collection('agents').createIndex({ status: 1 });

    // teams
    await db.collection('teams').createIndex({ intentMapping: 1 });

    // otpTokens (TTL index)
    await db.collection('otptokens').createIndex({ agentId: 1 });
    await db.collection('otptokens').createIndex({ phone: 1 });
    await db.collection('otptokens').createIndex({ createdAt: 1 }, { expireAfterSeconds: 300 });

    console.log('All indexes created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create indexes:', error);
    process.exit(1);
  }
}

createIndexes();
