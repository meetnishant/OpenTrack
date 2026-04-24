import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";
const NUM_VEHICLES = 100;

console.log(`🔥 Starting stress test: Spawning ${NUM_VEHICLES} units...`);

const vehicles = Array.from({ length: NUM_VEHICLES }).map((_, i) => ({
  id: `V-${i + 1}`,
  lat: 25.4358 + (Math.random() - 0.5) * 0.1,
  lng: 81.8463 + (Math.random() - 0.5) * 0.1,
  speed: Math.random() * 60,
  heading: Math.random() * 360
}));

const socket = io(SOCKET_URL);

socket.on("connect", () => {
  console.log("🚀 Connected to Live Engine. Unleashing fleet...");

  setInterval(() => {
    vehicles.forEach(v => {
      // Small jitter movement
      v.lat += (Math.random() - 0.5) * 0.0001;
      v.lng += (Math.random() - 0.5) * 0.0001;
      v.heading = (v.heading + (Math.random() - 0.5) * 10) % 360;

      socket.emit("v_upd", v);
    });
    
    process.stdout.write(`\r📡 Broadcasting ${NUM_VEHICLES} updates per second...`);
  }, 1000);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection failed:", err.message);
});
