import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export async function POST(req: Request) {
  try {
    if (process.env.DISABLE_PUBLIC_INGESTION === "true") {
      return NextResponse.json({ error: "API Ingestion is disabled in Demo Mode" }, { status: 403 });
    }

    const apiKey = req.headers.get("x-api-key");
    const validKey = process.env.TRACKING_API_KEY;

    if (!apiKey || apiKey !== validKey) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing API Key" }, { status: 401 });
    }

    const data = await req.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Payload must be a non-empty array of locations" }, { status: 400 });
    }

    // Extract unique vehicles to ensure they exist
    const vehicleIds = [...new Set(data.map((d: any) => d.id))];

    // Ensure all vehicles exist (upsert)
    await Promise.all(
      vehicleIds.map((id: string) =>
        prisma.vehicle.upsert({
          where: { id },
          update: {},
          create: { id, type: "commercial", status: "active" }
        })
      )
    );

    // Map payload to database format
    const locationData = data.map((d: any) => ({
      vehicleId: d.id,
      latitude: d.lat,
      longitude: d.lng,
      speed: d.speed || 0,
      passengers: d.passengers || 0,
      heading: d.heading || 0,
      timestamp: d.timestamp ? new Date(d.timestamp) : new Date()
    }));

    // Perform batch insert
    const result = await prisma.location.createMany({
      data: locationData,
      skipDuplicates: true
    });

    // Fire webhook for the batch operation
    import("@/lib/webhooks").then(w => w.dispatchWebhook("batch.ingested", { count: result.count }));

    // Broadcast the LATEST location of each vehicle to the live fleet
    const latestLocations = new Map();
    data.forEach((d: any) => latestLocations.set(d.id, d));

    latestLocations.forEach((d) => {
      socket.emit("v_upd", {
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        speed: d.speed || 0,
        passengers: d.passengers || 0,
        heading: d.heading || 0
      });
    });

    return NextResponse.json({ success: true, inserted: result.count });
  } catch (error: any) {
    console.error("Batch Tracking API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
