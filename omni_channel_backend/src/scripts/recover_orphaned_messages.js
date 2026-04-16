const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

async function recover() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const allUsers = await User.find({});
  const userMap = new Map();
  const phoneMap = new Map();
  const emailMap = new Map();
  const telegramMap = new Map();

  allUsers.forEach(u => {
    userMap.set(u._id.toString(), u);
    if (u.phone) phoneMap.set(u.phone, u._id);
    if (u.email) emailMap.set(u.email.toLowerCase(), u._id);
    if (u.telegramChatId) telegramMap.set(u.telegramChatId, u._id);
  });

  console.log(`Mapped ${allUsers.length} active users.`);

  // 1. Find Orphaned Conversations
  const allConvs = await Conversation.find({});
  let fixedConvsCount = 0;
  let fixedMsgsCount = 0;

  for (const conv of allConvs) {
    if (!conv.userId || !userMap.has(conv.userId.toString())) {
      console.log(`[ORPHAN] Found orphaned conversation ${conv._id} (User: ${conv.userId})`);
      
      // Look for a master user by checking channel identifiers
      let masterId = null;

      // Check messages in this conversation for identifiers
      const msgs = await Message.find({ conversationId: conv._id });
      for (const m of msgs) {
        if (m.channel === 'telegram' && m.metadata?.telegramChatId && telegramMap.has(m.metadata.telegramChatId)) {
          masterId = telegramMap.get(m.metadata.telegramChatId);
        } else if (m.channel === 'email' && m.metadata?.fromEmail && emailMap.has(m.metadata.fromEmail.toLowerCase())) {
          masterId = emailMap.get(m.metadata.fromEmail.toLowerCase());
        } else if (emailMap.has(m.metadata?.email?.toLowerCase())) {
          masterId = emailMap.get(m.metadata.email.toLowerCase());
        }
        
        if (masterId) break;
      }

      if (masterId) {
        console.log(`[FIX] Re-linking conversation ${conv._id} to master user ${masterId}`);
        conv.userId = masterId;
        await conv.save();
        
        // Also fix all messages in this conversation
        const msgRes = await Message.updateMany({ conversationId: conv._id }, { $set: { userId: masterId } });
        fixedConvsCount++;
        fixedMsgsCount += msgRes.modifiedCount;
      }
    }
  }

  // 2. Resolve Duplicate Threads for the same user
  console.log('Final consolidation of duplicate threads...');
  const consolidation = await Conversation.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  let consolidatedCount = 0;
  for (const group of consolidation) {
    if (!group._id) continue;
    // Sort by updatedAt to keep the most recent as master thread
    const threads = await Conversation.find({ _id: { $in: group.ids } }).sort({ updatedAt: -1 });
    const masterThread = threads[0];
    const duplicates = threads.slice(1);

    for (const dup of duplicates) {
      await Message.updateMany({ conversationId: dup._id }, { $set: { conversationId: masterThread._id } });
      await Conversation.deleteOne({ _id: dup._id });
      consolidatedCount++;
    }
  }

  console.log(`Recovery Complete.`);
  console.log(`- Conversations re-linked: ${fixedConvsCount}`);
  console.log(`- Messages re-linked: ${fixedMsgsCount}`);
  console.log(`- Split Threads Consolidated: ${consolidatedCount}`);

  process.exit(0);
}

recover().catch(console.error);
