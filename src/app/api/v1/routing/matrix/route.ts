import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { origin, vehicleIds } = data; // origin: [lng, lat], vehicleIds: string[]

    if (!origin || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return NextResponse.json({ error: "Missing origin coordinates or vehicleIds array" }, { status: 400 });
    }

    // 1. Fetch latest locations for requested vehicles
    // We get the most recent location record per vehicle
    const vehiclesData = await Promise.all(
      vehicleIds.map(async (id) => {
        const loc = await prisma.location.findFirst({
          where: { vehicleId: id },
          orderBy: { timestamp: 'desc' }
        });
        return { id, loc };
      })
    );

    const activeVehicles = vehiclesData.filter(v => v.loc !== null);

    if (activeVehicles.length === 0) {
      return NextResponse.json({ error: "None of the requested vehicles have known locations" }, { status: 404 });
    }

    // 2. Format coordinates string for OSRM
    // OSRM format: {lng},{lat};{lng},{lat}
    // First coordinate is origin, subsequent are vehicles
    const coords = [origin];
    activeVehicles.forEach(v => coords.push([v.loc!.longitude, v.loc!.latitude]));

    const coordsString = coords.map(c => `${c[0]},${c[1]}`).join(';');

    // 3. Call OSRM Table Service
    // We only need the distance/duration from source (0) to all destinations
    const osrmUrl = `https://router.project-osrm.org/table/v1/driving/${coordsString}?sources=0`;
    
    const osrmRes = await fetch(osrmUrl);
    const matrix = await osrmRes.json();

    if (matrix.code !== "Ok") {
      throw new Error(`OSRM Error: ${matrix.code}`);
    }

    // 4. Map results back to vehicles and find the nearest
    // matrix.durations[0] is an array of durations from origin to all points
    // [0] is origin->origin (0s). [1] is origin->vehicle1, etc.
    const results = activeVehicles.map((v, idx) => {
      return {
        vehicleId: v.id,
        durationSeconds: matrix.durations[0][idx + 1],
        distanceMeters: matrix.distances ? matrix.distances[0][idx + 1] : null,
        location: [v.loc!.longitude, v.loc!.latitude]
      };
    });

    // Sort by duration
    results.sort((a, b) => (a.durationSeconds || Infinity) - (b.durationSeconds || Infinity));

    return NextResponse.json({
      success: true,
      nearestVehicle: results[0],
      matrix: results
    });

  } catch (error: any) {
    console.error("Matrix API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
