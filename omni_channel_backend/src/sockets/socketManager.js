const identityService = require('../services/identityService');
const conversationService = require('../services/conversationService');

const socketManager = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific conversation room
    socket.on('join_conversation', ({ conversationId, agent }) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
      
      // If an agent joins, notify others in the room for collision detection
      if (agent) {
        socket.to(conversationId).emit('agent_presence', {
          conversationId,
          agent,
          type: 'join'
        });
        
        // Track agent ID on socket for disconnect cleanup
        socket.agentInfo = { conversationId, agent };
      }
    });

    socket.on('leave_conversation', ({ conversationId, agent }) => {
      socket.leave(conversationId);
      if (agent) {
        socket.to(conversationId).emit('agent_presence', {
          conversationId,
          agent,
          type: 'leave'
        });
      }
    });

    // Handle agent typing status
    socket.on('agent_typing', ({ conversationId, agent, isTyping }) => {
      socket.to(conversationId).emit('agent_typing', {
        conversationId,
        agent,
        isTyping
      });
    });

    // Handle Web Chat customer message
    socket.on('send_message', async (data) => {
      try {
        const { content, email, phone, name } = data;
        
        // 1. Resolve Identity (Web Chat)
        // Using email/phone if provided, otherwise using socket ID as a temporary identifier
        const identifier = email || phone || `socket_${socket.id}`;
        const { user } = await identityService.resolveIdentity('webchat', identifier, name);

        // 2. Process Message + Run AI Pipeline
        const { conversation, newMessage, aiMessage } = await conversationService.processIncomingMessage(
          user, 
          'webchat', 
          content
        );

        // 3. Emit events
        // To the specific conversation room (User view)
        io.to(conversation._id.toString()).emit('new_message', {
          conversationId: conversation._id,
          message: newMessage,
          channel: 'webchat'
        });

        // To everyone (Agent Dashboard view) - Includes AI results
        io.emit('conversation_updated', {
          conversationId: conversation._id,
          status: conversation.status,
          sentiment: conversation.sentiment,
          intent: conversation.intent,
          aiSuggestion: aiMessage.content,
          lastMessage: content.substring(0, 100)
        });

      } catch (error) {
        console.error('Socket: Error processing send_message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.agentInfo) {
        const { conversationId, agent } = socket.agentInfo;
        socket.to(conversationId).emit('agent_presence', {
          conversationId,
          agent,
          type: 'leave'
        });
      }
    });
  });

  return {
    emitHandoff: (conversationId, targetAgent) => {
      io.to(conversationId.toString()).emit('handoff_occurred', {
        conversationId: conversationId.toString(),
        targetAgent
      });
      // Global update to refresh sidebar
      io.emit('conversation_updated', { conversationId: conversationId.toString() });
    },
    // Helper to emit AI results from external services (Webhooks/Email)
    emitAiResults: (conversation, aiMessage) => {
      if (!conversation || !aiMessage) return;

      const conversationId = conversation._id.toString();
      
      // 1. Notify the specific chat room with the AI reply
      io.to(conversationId).emit('new_message', { 
        conversationId, 
        message: aiMessage, 
        channel: aiMessage.channel 
      });

      // 2. Notify the dashboard with updated metadata
      io.emit('conversation_updated', { 
        conversationId, 
        status: conversation.status, 
        sentiment: conversation.sentiment, 
        intent: conversation.intent,
        aiSummary: conversation.aiSummary,
        suggestedReplies: conversation.suggestedReplies || [],
        lastMessage: aiMessage.content?.substring(0, 100) || ''
      });
    },
    // Simple helper for incoming messages without manual AI results (like Email/Webhooks)
    emitNewMessage: (conversationId, message) => {
      if (!conversationId || !message) return;
      const idStr = conversationId.toString();
      
      io.to(idStr).emit('new_message', { 
        conversationId: idStr, 
        message, 
        channel: message.channel 
      });

      // ALSO Notify the dashboard instantly (even before AI)
      io.emit('conversation_updated', { 
        conversationId: idStr,
        status: 'open',
        lastMessage: message.content?.substring(0, 100) || '',
        isInstant: true // Flag to indicate this is a pre-AI update
      });
    },
    // New helper to notify UI to remove a merged conversation
    emitConversationDeleted: (conversationId) => {
      if (!conversationId) return;
      const idStr = conversationId.toString();
      console.log(`[SOCKET] Notifying deletion of conversation: ${idStr}`);
      io.emit('conversation_deleted', { conversationId: idStr });
    },
    // New helper to notify UI to refresh notification counts
    emitNotificationUpdated: () => {
      console.log('[SOCKET] Notifying notification update to all clients');
      io.emit('notification_updated');
    }
  };
};

module.exports = socketManager;
