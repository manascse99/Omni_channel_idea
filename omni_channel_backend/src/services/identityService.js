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

    const newUserObj = {
      name: name || fallbackName,
      channelHistory: [channel],
      lastChannel: channel,
      preferredChannel: channel,
      firstInteractionAt: new Date()
    };

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

      await existingOtherUser.save();

      // Lazy load models to avoid circular dependencies if any
      const Conversation = require('../models/Conversation');
      const Message = require('../models/Message');
      const Notification = require('../models/Notification');
      
      // Transfer records
      await Conversation.updateMany({ userId: user._id }, { userId: existingOtherUser._id });
      await Message.updateMany({ userId: user._id }, { userId: existingOtherUser._id });
      await Notification.updateMany({ userId: user._id }, { userId: existingOtherUser._id });

      // Clean up the secondary profile
      await User.findByIdAndDelete(user._id);
      
      return existingOtherUser;
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
    return user;

  } catch (error) {
    console.error("Identity Linking Error:", error);
    throw error;
  }
}

module.exports = {
  resolveIdentity,
  linkIdentity
};
