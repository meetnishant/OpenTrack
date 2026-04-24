import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export async function POST(req: Request) {
  try {
    // 1. API Key Validation
    if (process.env.DISABLE_PUBLIC_INGESTION === "true") {
      return NextResponse.json({ error: "API Ingestion is disabled in Demo Mode" }, { status: 403 });
    }

    const apiKey = req.headers.get("x-api-key");
    const validKey = process.env.TRACKING_API_KEY;

    if (!apiKey || apiKey !== validKey) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing API Key" }, { status: 401 });
    }

    const data = await req.json();
    const { id, lat, lng, speed, passengers, heading } = data;

    if (!id || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Persist to Database
    const location = await prisma.location.create({
      data: {
        vehicle: {
          connectOrCreate: {
            where: { id },
            create: { id, type: "commercial", status: "active" }
          }
        },
        latitude: lat,
        longitude: lng,
        speed: speed || 0,
        passengers: passengers || 0,
        heading: heading || 0,
        timestamp: new Date()
      }
    });

    // Fire webhook asynchronously
    import("@/lib/webhooks").then(w => w.dispatchWebhook("location.updated", location));

    // 3. Broadcast to Live Fleet via WebSocket Server
    socket.emit("v_upd", {
      id,
      lat,
      lng,
      speed: speed || 0,
      passengers: passengers || 0,
      heading: heading || 0
    });

    return NextResponse.json({ success: true, locationId: location.id });
  } catch (error: any) {
    console.error("Tracking API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
