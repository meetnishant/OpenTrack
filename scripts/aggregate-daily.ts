import { PrismaClient } from "@prisma/client";
import * as turf from "@turf/turf";

const prisma = new PrismaClient();

async function aggregateYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(`🚀 Aggregating analytics for: ${yesterday.toISOString()}`);

  const vehicles = await prisma.vehicle.findMany({ select: { id: true } });

  for (const vehicle of vehicles) {
    const locations = await prisma.location.findMany({
      where: {
        vehicleId: vehicle.id,
        timestamp: {
          gte: yesterday,
          lt: today
        }
      },
      orderBy: { timestamp: "asc" }
    });

    if (locations.length < 2) continue;

    let totalDistance = 0;
    let idleTimeMinutes = 0;
    let totalSpeed = 0;

    for (let i = 0; i < locations.length - 1; i++) {
      const p1 = [locations[i].longitude, locations[i].latitude];
      const p2 = [locations[i+1].longitude, locations[i+1].latitude];
      
      const dist = turf.distance(p1, p2, { units: "kilometers" });
      totalDistance += dist;
      totalSpeed += locations[i].speed || 0;

      // Simple idle logic: if speed < 5km/h and duration > 5 mins
      const durationMs = locations[i+1].timestamp.getTime() - locations[i].timestamp.getTime();
      if ((locations[i].speed || 0) < 5) {
        idleTimeMinutes += durationMs / (1000 * 60);
      }
    }

    const avgSpeed = totalSpeed / locations.length;

    await prisma.analytics.upsert({
      where: {
        vehicleId_date: {
          vehicleId: vehicle.id,
          date: yesterday
        }
      },
      update: {
        totalDistance,
        idleTimeMinutes: Math.round(idleTimeMinutes),
        avgSpeed
      },
      create: {
        vehicleId: vehicle.id,
        date: yesterday,
        totalDistance,
        idleTimeMinutes: Math.round(idleTimeMinutes),
        avgSpeed
      }
    });

    console.log(`✅ ${vehicle.id}: Dist=${totalDistance.toFixed(2)}km, Idle=${Math.round(idleTimeMinutes)}min`);
  }

  console.log("🏁 Daily aggregation complete.");
}

aggregateYesterday()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
