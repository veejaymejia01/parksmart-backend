import { getIO } from '../config/socket.js';
import registerSlotEvents from './slotEvents.js';

export const registerSocketEvents = () => {
  const io = getIO();

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    registerSlotEvents(socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default registerSocketEvents;

