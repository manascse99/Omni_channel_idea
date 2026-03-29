import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const { socket } = get();
    if (socket) return; // Already exists

    console.log('SocketStore: Initializing connection...');
    const newSocket = io(SOCKET_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      console.log('SocketStore: Connected established with ID:', newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('SocketStore: Disconnected. Reason:', reason);
      set({ isConnected: false });
    });

    newSocket.on('connect_error', (error) => {
      console.error('SocketStore: Connection Error:', error.message);
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log('SocketStore: Manual disconnect...');
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  // Helper to join/leave rooms
  joinRoom: (roomId) => {
    const { socket } = get();
    if (socket) {
      console.log('SocketStore: Joining room:', roomId);
      socket.emit('join_conversation', { conversationId: roomId });
    }
  },

  leaveRoom: (roomId) => {
    const { socket } = get();
    if (socket) {
      console.log('SocketStore: Leaving room:', roomId);
      socket.emit('leave_conversation', { conversationId: roomId });
    }
  }
}));

export default useSocketStore;
