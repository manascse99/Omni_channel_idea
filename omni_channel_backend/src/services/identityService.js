const User = require('../models/User');

/**
 * Resolves a user's identity based on their channel identifier.
 * Automatically handles merging if a user connects a new channel.
 */
async function resolveIdentity(channel, identifier) {
  let query = {};
  if (channel === 'whatsapp') {
    query = { phone: identifier };
  } else if (channel === 'email') {
    query = { email: identifier };
  } else {
    // For Webchat, identifier would be a session ID or similar, 
    // but for now we focus on WA and Email.
    return { user: null, isNew: false };
  }

  try {
    let user = await User.findOne(query);

    if (user) {
      // User found. Update lastSeen and channel history.
      user.lastSeen = new Date();
      user.lastChannel = channel;
      
      if (!user.channelHistory.includes(channel)) {
        user.channelHistory.push(channel);
      }
      
      await user.save();
      return { user, isNew: false };
    }

    // User not found, create a new one.
    const newUserObj = {
      channelHistory: [channel],
      lastChannel: channel,
      preferredChannel: channel
    };

    if (channel === 'whatsapp') {
      newUserObj.phone = identifier;
    } else if (channel === 'email') {
      newUserObj.email = identifier;
    }

    user = await User.create(newUserObj);
    return { user, isNew: true };
    
  } catch (error) {
    if (error.code === 11000) {
      // Rare race condition where user was created between findOne and create.
      console.warn("Duplicate key error during identity resolution. Retrying...");
      return resolveIdentity(channel, identifier); 
    }
    console.error("Identity Resolution Error:", error);
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
      // Do NOT auto-merge. Flag the current user.
      user.duplicateWarning = true;
      await user.save();
      return user;
    }

    // No conflict, safe to merge
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
