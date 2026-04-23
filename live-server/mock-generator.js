import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const VEHICLE_COUNT = 50; 
const vehicles = [];

// Prayagraj coordinates: [81.8463, 25.4358]
function initVehicles() {
  for (let i = 0; i < VEHICLE_COUNT; i++) {
    vehicles.push({
      id: `V-${100 + i}`,
      lat: 25.4358 + (Math.random() - 0.5) * 0.05,
      lng: 81.8463 + (Math.random() - 0.5) * 0.05,
      speed: 20 + Math.random() * 40,
      passengers: Math.floor(Math.random() * 50),
      heading: Math.random() * 360
    });
  }
}

function updatePositions() {
  vehicles.forEach(v => {
    const moveFactor = 0.0002;
    v.lat += (Math.random() - 0.5) * moveFactor;
    v.lng += (Math.random() - 0.5) * moveFactor;
    v.speed = Math.max(5, v.speed + (Math.random() - 0.5) * 2);
    v.heading = (v.heading + (Math.random() - 0.5) * 15) % 360;

    socket.emit('v_upd', v);
  });
}

socket.on('connect', () => {
  console.log('Connected to Live Engine. Spawning fleet in Prayagraj...');
  initVehicles();
  setInterval(updatePositions, 2000);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server.');
});
