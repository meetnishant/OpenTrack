import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

client.on("error", (err) => console.error("Redis Client Error", err));

if (!client.isOpen) {
  client.connect();
}

export { client as redis };
