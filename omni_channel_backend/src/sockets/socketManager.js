const identityService = require('../services/identityService');
const conversationService = require('../services/conversationService');

const socketManager = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
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
    });
  });

  return {
    // Helper to emit AI results from external services (Webhooks/Email)
    emitAiResults: (conversation, newMessage, aiMessage) => {
      if (!conversation || !newMessage) return; // Safety guard

      const conversationId = conversation._id.toString();
      const aiContent = aiMessage?.content || ''; // Guard against undefined aiMessage
      
      // Notify the specific chat room
      io.to(conversationId).emit('new_message', { 
        conversationId, 
        message: newMessage, 
        channel: newMessage.channel 
      });

      // Notify the dashboard
      io.emit('conversation_updated', { 
        conversationId, 
        status: conversation.status, 
        sentiment: conversation.sentiment, 
        intent: conversation.intent,
        aiSuggestion: aiContent,
        lastMessage: newMessage.content?.substring(0, 100) || ''
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

      // Also notify dashboard that a conversation was updated
      io.emit('conversation_updated', { 
        conversationId: idStr,
        lastMessage: message.content?.substring(0, 100) || ''
      });
    }
  };
};

module.exports = socketManager;
