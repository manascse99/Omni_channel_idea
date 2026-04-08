require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST']
  }
});

app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Setup Sockets and get emitters
const socketService = require('./src/sockets/socketManager')(io);

// Global Socket Injection Middleware
app.use((req, res, next) => {
  req.socketService = socketService;
  next();
});

// Setup routes
app.use('/api', require('./src/routes/api'));
app.use('/webhook', require('./src/routes/webhooks'));

// Temporary root route
app.get('/', (req, res) => {
  res.send('OmniBank AI Backend is running.');
});

// Initialize Mail Receiver (IMAP)
const MailReceiver = require('./src/services/mailReceiver');
const mailReceiver = new MailReceiver(io, socketService);
mailReceiver.start();

// Initialize Discord Bot
const DiscordService = require('./src/services/discordService');
const discordService = new DiscordService(io, socketService);
discordService.start();

// Store services on app for access in routes
app.set('discordService', discordService);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
