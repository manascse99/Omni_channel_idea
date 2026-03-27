const socketManager = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Handle generic unauthenticated Web Chat client message
    socket.on('send_message', async (data) => {
      console.log(`Received Web Chat message from socket ${socket.id}:`, data);
      
      // In a full implementation, you'd link this to IdentityService here.
      // But for the scope of the backend routes, we simply echo back or 
      // broadcast to the agent dashboard.
      const timestamp = new Date();
      io.emit('new_message', {
        conversationId: data.conversationId || 'webchat-session',
        message: {
          content: data.content,
          senderType: 'user',
          channel: 'webchat',
          timestamp
        },
        channel: 'webchat'
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Exportable emitter function for use in standard Express routes
  return {
    emitNewMessage: (conversationId, message, channel) => {
      io.to(conversationId).emit('new_message', { conversationId, message, channel });
    },
    emitConversationUpdated: (conversationId, status, sentiment, intent) => {
      io.emit('conversation_updated', { conversationId, status, sentiment, intent });
    },
    emitAgentAssigned: (conversationId, agentId, teamId) => {
      io.emit('agent_assigned', { conversationId, agentId, teamId });
    },
    emitAiReplySent: (conversationId, message) => {
      io.to(conversationId).emit('ai_reply_sent', { conversationId, message });
    }
  };
};

module.exports = socketManager;
