const User = require('../models/User');

/**
 * Resolves a user's identity based on their channel identifier.
 * Automatically handles merging if a user connects a new channel.
 */
async function resolveIdentity(channel, identifier, name = null) {
  let query = {};
  const lowerIdentifier = identifier.toLowerCase();
  
  if (channel === 'whatsapp') {
    query = { phone: identifier };
  } else if (channel === 'telegram') {
    query = { telegramChatId: identifier };
  } else if (channel === 'discord') {
    query = { discordUserId: identifier };
  } else if (channel === 'email' || channel === 'webchat') {
    // Both email and webchat use email as primary ID
    query = { email: lowerIdentifier };
  } else {
    return { user: null, isNew: false };
  }

  try {
    let user = await User.findOne(query);

    if (user) {
      user.lastSeen = new Date();
      user.lastChannel = channel;
      
      // Update name if it was null or just the email
      if (name && (!user.name || user.name === 'Unknown User' || user.name === user.email)) {
        user.name = name;
      }

      if (!user.channelHistory.includes(channel)) {
        user.channelHistory.push(channel);
      }
      
      await user.save();
      return { user, isNew: false };
    }

    // Determine fallback name
    const fallbackName = channel === 'email' ? lowerIdentifier.split('@')[0] : 'New User';
    const finalName = name || fallbackName;

    // --- GENERAL CASE FIX: Soft Match Duplicate Detection ---
    // If we're creating a new user, check if someone with the SAME name already exists.
    // This handles the "2 channels" problem by alerting the agent.
    const potentialDuplicate = await User.findOne({ 
      name: { $regex: new RegExp(`^${finalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
    });

    const newUserObj = {
      name: finalName,
      channelHistory: [channel],
      lastChannel: channel,
      preferredChannel: channel,
      firstInteractionAt: new Date(),
      duplicateWarning: !!potentialDuplicate // Flag automatically if name exists elsewhere
    };
    
    if (potentialDuplicate) {
      console.log(`[IDENTITY] Potential duplicate detected by name: "${finalName}". Setting duplicateWarning: true.`);
    }

    if (channel === 'whatsapp') {
      newUserObj.phone = identifier;
    } else if (channel === 'telegram') {
      newUserObj.telegramChatId = identifier;
    } else if (channel === 'discord') {
      newUserObj.discordUserId = identifier;
    } else {
      newUserObj.email = lowerIdentifier;
    }

    user = await User.create(newUserObj);
    return { user, isNew: true };
    
  } catch (error) {
    if (error.code === 11000) return resolveIdentity(channel, identifier, name);
    throw error;
  }
}

/**
 * Advanced Identity Linking (Merge Logic)
 * E.g., The AI finds a phone number in an email from an unknown address,
 * so we link the new email to the existing phone account.
 */
async function linkIdentity(primaryUserId, additionalIdentifier, identifierType) {
  try {
    const user = await User.findById(primaryUserId);
    if (!user) return null;

    // Check if another account is already using this identifier
    const query = {};
    query[identifierType] = additionalIdentifier;
    
    const existingOtherUser = await User.findOne(query);
    
    if (existingOtherUser && existingOtherUser._id.toString() !== primaryUserId) {
      // Conflict: Another profile already owns this phone/email!
      // We will merge `user` into `existingOtherUser` (Master)
      
      console.log(`[IDENTITY] Merge conflict detected in linkIdentity. Merging ${user._id} -> ${existingOtherUser._id}`);

      if (user.telegramChatId && !existingOtherUser.telegramChatId) existingOtherUser.telegramChatId = user.telegramChatId;
      if (user.phone && !existingOtherUser.phone) existingOtherUser.phone = user.phone;
      if (user.discordUserId && !existingOtherUser.discordUserId) existingOtherUser.discordUserId = user.discordUserId;
      if (user.email && !existingOtherUser.email) existingOtherUser.email = user.email;
      
      user.channelHistory.forEach(ch => {
        if (!existingOtherUser.channelHistory.includes(ch)) {
          existingOtherUser.channelHistory.push(ch);
        }
      });
      
      if (user.name && user.name !== 'New User' && (!existingOtherUser.name || existingOtherUser.name === 'New User')) {
        existingOtherUser.name = user.name;
      }

      // CRITICAL: Unset identifiers on duplicate to prevent E11000 duplicate key error on save
      await User.updateOne(
        { _id: user._id }, 
        { $unset: { email: 1, phone: 1, telegramChatId: 1, discordUserId: 1 } }
      );

      let deletedConversationId = null;
      if (dupConversation) {
        if (primaryConversation) {
          // Merge messages into the master thread
          await Message.updateMany({ conversationId: dupConversation._id }, { conversationId: primaryConversation._id });
          deletedConversationId = dupConversation._id;
          await Conversation.deleteOne({ _id: dupConversation._id });
        } else {
          // No primary conversation, so the duplicate's becomes the primary
          await Conversation.updateOne({ _id: dupConversation._id }, { userId: existingOtherUser._id });
        }
      }

      // Transfer other records
      await Message.updateMany({ userId: user._id }, { userId: existingOtherUser._id });
      await Notification.updateMany({ userId: user._id }, { userId: existingOtherUser._id });

      // Clean up the secondary profile
      await User.findByIdAndDelete(user._id);
      
      return { masterUser: existingOtherUser, deletedConversationId };
    }

    // No conflict, safe to add identifier
    if (identifierType === 'phone') {
      user.phone = additionalIdentifier;
      if (!user.channelHistory.includes('whatsapp')) user.channelHistory.push('whatsapp');
    } else if (identifierType === 'email') {
      user.email = additionalIdentifier;
      if (!user.channelHistory.includes('email')) user.channelHistory.push('email');
    }

    await user.save();
    return { masterUser: user, deletedConversationId: null };

  } catch (error) {
    console.error("Identity Linking Error:", error);
    throw error;
  }
}

/**
 * Merges a secondary (duplicate) user profile into a primary user profile.
 * Designed to be triggered manually by an Admin/Agent.
 */
async function mergeUsers(primaryUserId, duplicateUserId) {
  if (primaryUserId === duplicateUserId) {
    throw new Error('Cannot merge a user with themselves.');
  }

  console.log(`[MERGE] Starting merge: Duplicate (${duplicateUserId}) -> Primary (${primaryUserId})`);

  const primaryUser = await User.findById(primaryUserId);
  const duplicateUser = await User.findById(duplicateUserId);

  if (!primaryUser || !duplicateUser) {
    throw new Error('Both primary and duplicate users must exist.');
  }

  // Lazy load to avoid circular dependencies
  const Conversation = require('../models/Conversation');
  const Message = require('../models/Message');
  const Notification = require('../models/Notification');

  // Step 1: Update all messages from duplicate user to point to primary user
  console.log(`[MERGE] Transferring messages for userId ${duplicateUserId}...`);
  const messageUpdate = await Message.updateMany(
    { userId: duplicateUserId },
    { $set: { userId: primaryUserId } }
  );
  console.log(`[MERGE] Updated ${messageUpdate.modifiedCount} user-sent messages.`);

  // Step 2: Handle Conversation migration
  const primaryConversation = await Conversation.findOne({ userId: primaryUserId });
  const dupConversation = await Conversation.findOne({ userId: duplicateUserId });

  if (dupConversation) {
    console.log(`[MERGE] Found duplicate conversation: ${dupConversation._id}`);
    if (primaryConversation) {
      console.log(`[MERGE] Merging into primary conversation: ${primaryConversation._id}`);
      
      // Move all messages from duplicate conversation into primary conversation
      const convMessageUpdate = await Message.updateMany(
        { conversationId: dupConversation._id },
        { $set: { conversationId: primaryConversation._id } }
      );
      console.log(`[MERGE] Moved ${convMessageUpdate.modifiedCount} messages between threads.`);

      // Combine unread counts if applicable
      if (dupConversation.unreadCount > 0) {
        primaryConversation.unreadCount = (primaryConversation.unreadCount || 0) + dupConversation.unreadCount;
        primaryConversation.isRead = false;
      }

      // Preserve the most recent channel info
      if (dupConversation.updatedAt > primaryConversation.updatedAt) {
        primaryConversation.lastChannel = dupConversation.lastChannel;
        primaryConversation.lastMessage = dupConversation.lastMessage;
        primaryConversation.updatedAt = dupConversation.updatedAt;
      }

      await primaryConversation.save();

      // Delete the duplicate conversation safely
      await Conversation.deleteOne({ _id: dupConversation._id });
      console.log(`[MERGE] Deleted duplicate conversation.`);
    } else {
      console.log(`[MERGE] Primary has no conversation. Inheriting duplicate conversation.`);
      // If primary somehow doesn't have a conversation, inherit the duplicate's conversation
      await Conversation.updateOne(
        { _id: dupConversation._id },
        { $set: { userId: primaryUserId } }
      );
    }
  }

  // Step 3: Transfer Notifications
  await Notification.updateMany({ userId: duplicateUserId }, { userId: primaryUserId });

  // Step 4: Merge user profile fields
  console.log(`[MERGE] Unifying identifiers...`);
  if (!primaryUser.phone && duplicateUser.phone) primaryUser.phone = duplicateUser.phone;
  if (!primaryUser.email && duplicateUser.email) primaryUser.email = duplicateUser.email;
  if (!primaryUser.telegramChatId && duplicateUser.telegramChatId) primaryUser.telegramChatId = duplicateUser.telegramChatId;
  if (!primaryUser.discordUserId && duplicateUser.discordUserId) primaryUser.discordUserId = duplicateUser.discordUserId;
  
  if (duplicateUser.name && duplicateUser.name !== 'New User' && (!primaryUser.name || primaryUser.name === 'New User')) {
    primaryUser.name = duplicateUser.name;
  }

  // Inherit channel history
  duplicateUser.channelHistory.forEach(ch => {
    if (!primaryUser.channelHistory.includes(ch)) {
      primaryUser.channelHistory.push(ch);
    }
  });

  // Inherit tags
  if (duplicateUser.tags) {
    duplicateUser.tags.forEach(tg => {
      if (!primaryUser.tags.includes(tg)) {
        primaryUser.tags.push(tg);
      }
    });
  }

  // Use the older of the two firstInteractionAt dates
  if (duplicateUser.firstInteractionAt && primaryUser.firstInteractionAt) {
    if (new Date(duplicateUser.firstInteractionAt) < new Date(primaryUser.firstInteractionAt)) {
      primaryUser.firstInteractionAt = duplicateUser.firstInteractionAt;
    }
  }

  // Step 5: Bypass Mongoose and directly UNSET unique fields on MongoDB level
  // This aggressively frees up the constraints so primaryUser can absorb them safely
  await User.updateOne(
    { _id: duplicateUserId }, 
    { $unset: { email: 1, phone: 1, telegramChatId: 1, discordUserId: 1 } }
  );

  await primaryUser.save();
  console.log(`[MERGE] Primary profile updated.`);

  // Step 6: Delete the duplicate user
  await User.deleteOne({ _id: duplicateUserId });
  console.log(`[MERGE] Duplicate user deleted. Merge Complete.`);

  return primaryUser;
}

module.exports = {
  resolveIdentity,
  linkIdentity,
  mergeUsers
};
