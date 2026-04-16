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

  if (isSystemIdentifier(identifier)) {
    console.warn(`[IDENTITY] Blocked system identifier from resolving to user: ${identifier}`);
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
    if (isSystemIdentifier(additionalIdentifier)) {
      console.warn(`[IDENTITY-LINK] Blocked system identifier from linking: ${additionalIdentifier}`);
      return null;
    }

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

      // Fetch models and conversations for merging
      const Conversation = require('../models/Conversation');
      const Message = require('../models/Message');
      const Notification = require('../models/Notification');

      const primaryConversation = await Conversation.findOne({ userId: existingOtherUser._id });
      const dupConversations = await Conversation.find({ userId: user._id });

      let deletedConversationId = null;
      for (const dupConversation of dupConversations) {
        console.log(`[IDENTITY-MERGE] Unifying conversation: ${dupConversation._id}`);
        if (primaryConversation) {
          // Merge messages into the master thread
          await Message.updateMany({ conversationId: dupConversation._id }, { conversationId: primaryConversation._id });
          deletedConversationId = dupConversation._id; // Track for socket event (UI pruning)
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

  // Step 2: Handle Conversation migration (Handle ALL duplicate conversations)
  const primaryConversation = await Conversation.findOne({ userId: primaryUserId });
  const dupConversations = await Conversation.find({ userId: duplicateUserId });

  for (const dupConversation of dupConversations) {
    console.log(`[MERGE] Handling duplicate conversation: ${dupConversation._id}`);
    if (primaryConversation) {
      console.log(`[MERGE] Merging messages into primary: ${primaryConversation._id}`);
      
      // Move all messages from duplicate conversation into primary conversation
      const convMessageUpdate = await Message.updateMany(
        { conversationId: dupConversation._id },
        { $set: { conversationId: primaryConversation._id } }
      );
      console.log(`[MERGE] Moved ${convMessageUpdate.modifiedCount} messages.`);

      // Combine unread counts
      if (dupConversation.unreadCount > 0) {
        primaryConversation.unreadCount = (primaryConversation.unreadCount || 0) + dupConversation.unreadCount;
        primaryConversation.isRead = false;
      }

      // Preserve the most recent metadata
      if (!primaryConversation.updatedAt || dupConversation.updatedAt > primaryConversation.updatedAt) {
        primaryConversation.lastChannel = dupConversation.lastChannel;
        primaryConversation.lastMessage = dupConversation.lastMessage;
        primaryConversation.updatedAt = dupConversation.updatedAt;
      }

      // Delete the swallowed thread
      await Conversation.deleteOne({ _id: dupConversation._id });
    } else {
      console.log(`[MERGE] Primary has no conversation. Re-assigning duplicate thread.`);
      // Re-assign the entire conversation to the primary user
      await Conversation.updateOne(
        { _id: dupConversation._id },
        { $set: { userId: primaryUserId } }
      );
    }
  }

  if (primaryConversation) await primaryConversation.save();

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

  // Step 4.5: Unify Risk Profiles (Production Requirement)
  console.log(`[MERGE] Unifying risk profiles...`);
  // Keep the higher risk score (Bank's safest assumption)
  primaryUser.riskScore = Math.max(primaryUser.riskScore || 0, duplicateUser.riskScore || 0);
  
  // Combine and sort risk history
  if (duplicateUser.riskHistory && duplicateUser.riskHistory.length > 0) {
    primaryUser.riskHistory = [...(primaryUser.riskHistory || []), ...duplicateUser.riskHistory]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20); // Maintain capped length
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

/**
 * Safety check for production to prevent merging into system accounts.
 */
function isSystemIdentifier(identifier) {
  if (!identifier) return false;
  const sysPatterns = [
    'support@', 'info@', 'help@', 'admin@', 
    'no-reply@', 'noreply@', 'bank@', 'system@'
  ];
  const idStr = identifier.toLowerCase();
  return sysPatterns.some(pattern => idStr.includes(pattern));
}

module.exports = {
  resolveIdentity,
  linkIdentity,
  mergeUsers
};
