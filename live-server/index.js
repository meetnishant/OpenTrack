import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('v_upd', (data) => {
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

process.on('message', (data) => {
  if (data.type === 'VEHICLE_UPDATE') {
    io.emit('v_upd', data.payload);
  }
});
