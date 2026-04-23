import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assets = await prisma.vehicle.findMany({
      include: {
        _count: {
          select: { locations: true }
        }
      }
    });

    return NextResponse.json(assets);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { id, name, type, model, licensePlate, driverName, capacity, status } = data;

    if (!id) {
      return NextResponse.json({ error: "Missing required field 'id'" }, { status: 400 });
    }

    const asset = await prisma.vehicle.upsert({
      where: { id },
      update: {
        name,
        type,
        model,
        licensePlate,
        driverName,
        capacity,
        status: status || "active"
      },
      create: {
        id,
        name,
        type: type || "commercial",
        model,
        licensePlate,
        driverName,
        capacity,
        status: status || "active"
      }
    });

    return NextResponse.json(asset);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
