import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // Attempt to fetch from Redis Cache first
    const cachedFleet = await redis.hGetAll("fleet_snapshot");
    
    if (cachedFleet && Object.keys(cachedFleet).length > 0) {
      const units = Object.values(cachedFleet).map(v => JSON.parse(v));
      return NextResponse.json({
        source: "cache",
        count: units.length,
        units
      });
    }

    return NextResponse.json({
      source: "cache",
      count: 0,
      units: []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
