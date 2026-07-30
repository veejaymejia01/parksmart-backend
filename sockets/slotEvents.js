const registerSlotEvents = (socket) => {
  socket.on('slot:subscribe', (lotId) => {
    socket.join(`lot:${lotId}`);
    console.log(`Socket ${socket.id} subscribed to lot:${lotId}`);
  });

  socket.on('slot:unsubscribe', (lotId) => {
    socket.leave(`lot:${lotId}`);
    console.log(`Socket ${socket.id} unsubscribed from lot:${lotId}`);
  });
};

export default registerSlotEvents;

