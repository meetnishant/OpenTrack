import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { id, lat, lng, speed, passengers, heading } = data;

    if (!id || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Persist to Database
    const location = await prisma.location.create({
      data: {
        vehicle: {
          connectOrCreate: {
            where: { id },
            create: { id, type: "bus", status: "active" }
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

    // 2. Broadcast to Live Fleet via WebSocket Server
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
