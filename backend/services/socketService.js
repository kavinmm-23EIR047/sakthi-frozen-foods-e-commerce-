const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: '*', // We'll allow all for now, to ensure no CORS issues with their setup
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });

    io.on('connection', (socket) => {
      console.log('Socket client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Socket client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      console.warn('Socket.io not initialized yet!');
    }
    return io;
  },
  emitEvent: (event, data) => {
    if (io) {
      io.emit(event, data);
    }
  }
};
