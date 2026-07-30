import 'dotenv/config';
import http from 'http';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import app from './app.js';
import { initializeSocket } from './config/socket.js';
import { validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import { registerSocketEvents } from './sockets/index.js';

validateEnv();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);
registerSocketEvents();

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready`);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

