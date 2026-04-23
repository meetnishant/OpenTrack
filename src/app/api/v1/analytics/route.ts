import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      date: { gte: startDate }
    };

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const report = await prisma.analytics.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        // Option to join with vehicle metadata
      }
    });

    // Aggregates for the summary
    const summary = report.reduce((acc, curr) => {
      acc.totalDistance += curr.totalDistance;
      acc.totalIdleTime += curr.idleTimeMinutes;
      return acc;
    }, { totalDistance: 0, totalIdleTime: 0 });

    return NextResponse.json({
      summary,
      daily: report
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
