import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as Client } from 'socket.io-client';
import { Server } from 'socket.io';
import http from 'http';

describe('Live Engine WebSocket Broadcast', () => {
  let ioServer, httpServer, client1, client2;
  const PORT = 3005;

  beforeAll(async () => {
    return new Promise((resolve) => {
      httpServer = http.createServer();
      ioServer = new Server(httpServer);
      
      // Implement the relay logic for the test server
      ioServer.on('connection', (socket) => {
        socket.on('v_upd', (data) => {
          ioServer.emit('v_upd', data);
        });
      });

      httpServer.listen(PORT, () => {
        client1 = Client(`http://localhost:${PORT}`);
        client2 = Client(`http://localhost:${PORT}`);
        
        let connectedCount = 0;
        const checkDone = () => {
          connectedCount++;
          if (connectedCount === 2) resolve();
        };

        client1.on('connect', checkDone);
        client2.on('connect', checkDone);
      });
    });
  });

  afterAll(() => {
    if (ioServer) ioServer.close();
    if (httpServer) httpServer.close();
    if (client1) client1.disconnect();
    if (client2) client2.disconnect();
  });

  it('should broadcast vehicle updates to all clients', async () => {
    const mockUpdate = { id: 'V-101', lat: 43.76, lng: 11.25 };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Test timed out')), 4000);
      
      client2.on('v_upd', (data) => {
        clearTimeout(timeout);
        expect(data.id).toBe('V-101');
        expect(data.lat).toBe(43.76);
        resolve();
      });

      client1.emit('v_upd', mockUpdate);
    });
  });
});
