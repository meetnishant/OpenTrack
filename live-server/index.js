import http from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Redis setup
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.error('Redis Error', err));

async function start() {
  await redis.connect();
  console.log('📦 Connected to Redis Cache');

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('v_upd', async (data) => {
      // 1. Broadcast to all connected UI clients
      io.emit('v_upd', data);

      // 2. Cache in Redis (Hash per vehicle)
      // We store the whole payload as a JSON string for simplicity
      try {
        await redis.hSet('fleet_snapshot', data.id, JSON.stringify({
          ...data,
          lastUpdate: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Redis Cache Fail:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = 3001;
  server.listen(PORT, () => {
    console.log(`🚀 OpenTrack Live Engine (Redis Enabled) running on port ${PORT}`);
  });
}

start().catch(console.error);
