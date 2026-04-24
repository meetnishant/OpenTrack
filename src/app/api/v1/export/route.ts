import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const format = searchParams.get("format") || "json"; // "json" or "geojson"

    if (!vehicleId || !dateStr) {
      return NextResponse.json({ error: "Missing vehicleId or date (YYYY-MM-DD)" }, { status: 400 });
    }

    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    // Fetch all locations for the given vehicle and date
    const locations = await prisma.location.findMany({
      where: {
        vehicleId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: "asc" }
    });

    if (locations.length === 0) {
      return NextResponse.json({ message: "No data found for the specified parameters." }, { status: 404 });
    }

    if (format === "geojson") {
      const geojson = {
        type: "FeatureCollection",
        features: locations.map(loc => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [loc.longitude, loc.latitude]
          },
          properties: {
            speed: loc.speed,
            heading: loc.heading,
            passengers: loc.passengers,
            timestamp: loc.timestamp.toISOString()
          }
        }))
      };
      
      // Return as downloadable file
      return new NextResponse(JSON.stringify(geojson), {
        headers: {
          "Content-Type": "application/geo+json",
          "Content-Disposition": `attachment; filename="export_${vehicleId}_${dateStr}.geojson"`
        }
      });
    }

    // Default JSON response
    return NextResponse.json({
      vehicleId,
      date: dateStr,
      count: locations.length,
      data: locations
    });

  } catch (error: any) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
