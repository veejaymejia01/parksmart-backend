// ⚠️ MUST be first: sets MONGO_URI, JWT_SECRET fallbacks before any other imports
import './config/env.js';

import http from 'http';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import app from './app.js';
import { initializeSocket } from './config/socket.js';
import connectDB from './config/db.js';
import { registerSocketEvents } from './sockets/index.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);
registerSocketEvents();

connectDB()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Don't exit — let Railway keep the process alive
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  // Don't exit — let Railway keep the process alive
});
