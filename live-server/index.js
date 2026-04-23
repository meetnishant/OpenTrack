const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Listen for vehicle updates (from trackers or simulators)
  socket.on('v_upd', (data) => {
    // Re-broadcast to all connected clients (dashboards)
    io.emit('v_upd', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 OpenTrack Live Engine running on port ${PORT}`);
});

// Broadcast all incoming vehicle updates to all connected clients
process.on('message', (data) => {
  if (data.type === 'VEHICLE_UPDATE') {
    io.emit('v_upd', data.payload);
  }
});
