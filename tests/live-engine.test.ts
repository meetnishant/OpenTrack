import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as Client } from 'socket.io-client';
import { Server } from 'socket.io';
import http from 'http';

describe('Live Engine WebSocket Broadcast', () => {
  let io, server, client1, client2;
  const PORT = 3002; // Separate port for testing

  beforeAll(() => {
    return new Promise((resolve) => {
      server = http.createServer();
      io = new Server(server);
      server.listen(PORT, () => {
        client1 = Client(`http://localhost:${PORT}`);
        client2 = Client(`http://localhost:${PORT}`);
        client1.on('connect', () => {
          if (client2.connected) resolve();
        });
        client2.on('connect', () => {
          if (client1.connected) resolve();
        });

        // The logic we want to test:
        io.on('connection', (socket) => {
          socket.on('v_upd', (data) => {
            io.emit('v_upd', data);
          });
        });
      });
    });
  });

  afterAll(() => {
    client1.close();
    client2.close();
    io.close();
    server.close();
  });

  it('should broadcast vehicle update to all connected clients', () => {
    return new Promise((resolve) => {
      const mockData = { id: 'V-1', lat: 45, lng: 9 };
      
      client2.on('v_upd', (data) => {
        expect(data).toEqual(mockData);
        resolve();
      });

      client1.emit('v_upd', mockData);
    });
  });
});
