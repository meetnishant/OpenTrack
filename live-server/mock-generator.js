const { io } = require('socket.io-client');

const socket = io('http://localhost:3001');

const VEHICLE_COUNT = 50; // Starting with 50 for stability
const vehicles = [];

// Florence bounds roughly: [11.25, 43.76]
function initVehicles() {
  for (let i = 0; i < VEHICLE_COUNT; i++) {
    vehicles.push({
      id: `V-${100 + i}`,
      lat: 43.767 + (Math.random() - 0.5) * 0.01,
      lng: 11.254 + (Math.random() - 0.5) * 0.01,
      speed: 30 + Math.random() * 40,
      passengers: Math.floor(Math.random() * 20),
      heading: Math.random() * 360
    });
  }
}

function updatePositions() {
  vehicles.forEach(v => {
    // Move slightly
    v.lat += (Math.random() - 0.5) * 0.0001;
    v.lng += (Math.random() - 0.5) * 0.0001;
    v.speed = Math.max(0, v.speed + (Math.random() - 0.5) * 5);
    v.heading = (v.heading + (Math.random() - 0.5) * 10) % 360;

    // Send update
    socket.emit('v_upd', v);
  });
}

socket.on('connect', () => {
  console.log('Connected to Live Engine. Starting simulation...');
  initVehicles();
  setInterval(updatePositions, 2000); // Update every 2 seconds
});

socket.on('disconnect', () => {
  console.log('Disconnected from server.');
});
