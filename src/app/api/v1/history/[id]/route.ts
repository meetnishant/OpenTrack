import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const id = params.id;
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!id || !start || !end) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const locations = await prisma.location.findMany({
      where: {
        vehicleId: id,
        timestamp: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      orderBy: {
        timestamp: "asc",
      },
      select: {
        latitude: true,
        longitude: true,
        speed: true,
        heading: true,
        timestamp: true,
      }
    });

    // Convert to GeoJSON LineString for the map
    const coordinates = locations.map(l => [l.longitude, l.latitude]);
    
    return NextResponse.json({
      vehicleId: id,
      count: locations.length,
      path: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates
        },
        properties: {
          points: locations // Full metadata for playback interpolation
        }
      }
    });
  } catch (error: any) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
