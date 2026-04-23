import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const vehicleId = 'V-100';
  console.log(`Generating dummy history for ${vehicleId}...`);

  // Ensure vehicle exists
  await prisma.vehicle.upsert({
    where: { id: vehicleId },
    update: {},
    create: {
      id: vehicleId,
      name: 'Alpha-One',
      type: 'Truck',
      status: 'active'
    }
  });

  // Start point (Prayagraj area)
  let lat = 25.4358;
  let lng = 81.8463;
  let time = new Date();
  time.setHours(time.getHours() - 2); // Start 2 hours ago

  const locations = [];

  for (let i = 0; i < 200; i++) {
    // Move slightly north-east
    lat += (Math.random() * 0.0005) + 0.0001;
    lng += (Math.random() * 0.0005) + 0.0001;
    
    // Add 30 seconds
    time = new Date(time.getTime() + 30000);

    locations.push({
      vehicleId,
      latitude: lat,
      longitude: lng,
      speed: 40 + Math.random() * 20,
      heading: 45 + (Math.random() - 0.5) * 10,
      timestamp: time
    });
  }

  // Clear old history for this vehicle to prevent clutter
  await prisma.location.deleteMany({
    where: { vehicleId }
  });

  // Insert new history
  await prisma.location.createMany({
    data: locations
  });

  console.log(`✅ Inserted ${locations.length} historical points for ${vehicleId}.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
