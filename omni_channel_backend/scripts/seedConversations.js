require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const Agent = require(path.join(__dirname, '../src/models/Agent'));
const Team = require(path.join(__dirname, '../src/models/Team'));
const User = require(path.join(__dirname, '../src/models/User'));
const Conversation = require(path.join(__dirname, '../src/models/Conversation'));
const Message = require(path.join(__dirname, '../src/models/Message'));

async function seedConversations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    // Clear existing conversations/messages/users
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing conversation data...');

    // Find Teams
    const salesTeam = await Team.findOne({ name: 'Sales Team' });
    const supportTeam = await Team.findOne({ name: 'Customer Support' });
    const fraudTeam = await Team.findOne({ name: 'Fraud & Alerts' });

    // Find Agents
    const agents = await Agent.find().populate('teamId');

    // Create Sample Users
    const users = await User.create([
      { name: 'Rahul Khanna', phone: '918877665544', email: 'rahul@example.com', tags: ['VIP'] },
      { name: 'Anjali Sharma', phone: '919988776655', email: 'anjali@example.com', tags: ['NEW'] },
      { name: 'Vikram Singh', phone: '917766554433', email: 'vikram@example.com', tags: ['FREQUENT'] }
    ]);

    // Create Conversations
    const conversations = await Conversation.create([
      {
        userId: users[0]._id,
        status: 'open',
        lastChannel: 'whatsapp',
        intent: 'Loan Application',
        sentiment: 'positive',
        assignedTeam: salesTeam?._id,
        assignedTo: agents.find(a => a.teamId?.name === 'Sales Team')?._id,
        lastMessage: 'I want to apply for a personal loan.'
      },
      {
        userId: users[1]._id,
        status: 'open',
        lastChannel: 'email',
        intent: 'Balance Check',
        sentiment: 'neutral',
        assignedTeam: supportTeam?._id,
        assignedTo: agents.find(a => a.teamId?.name === 'Customer Support')?._id,
        lastMessage: 'Unable to see my account balance.'
      },
      {
        userId: users[2]._id,
        status: 'escalated',
        lastChannel: 'webchat',
        intent: 'Fraud Alert',
        sentiment: 'negative',
        assignedTeam: fraudTeam?._id,
        assignedTo: agents.find(a => a.teamId?.name === 'Fraud & Alerts')?._id,
        lastMessage: 'Unrecognized transaction on my credit card!'
      }
    ]);

    // Create Initial Messages
    for (const convo of conversations) {
      await Message.create({
        conversationId: convo._id,
        userId: convo.userId,
        senderType: 'user',
        content: convo.lastMessage,
        channel: convo.lastChannel,
        timestamp: new Date(Date.now() - 3600000)
      });

      await Message.create({
        conversationId: convo._id,
        userId: convo.userId,
        senderType: 'ai',
        content: `Hello ${users.find(u => u._id.equals(convo.userId)).name}, I am processing your request regarding ${convo.intent}.`,
        channel: convo.lastChannel,
        timestamp: new Date(Date.now() - 1800000)
      });
    }

    console.log(`\n✅ Seeded ${conversations.length} conversations across teams!`);
    console.log('The Teams Dashboard will now show real "Active" counts.');

  } catch (err) {
    console.error('Error seeding conversations:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedConversations();
