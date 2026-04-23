import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start"); // "lng,lat"
    const end = searchParams.get("end");     // "lng,lat"

    if (!start || !end) {
      return NextResponse.json({ error: "Missing start or end coordinates" }, { status: 400 });
    }

    const res = await fetch(`http://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`);
    const data = await res.json();

    if (data.code !== "Ok") throw new Error("Routing failed");

    return NextResponse.json({
      distance: data.routes[0].distance,
      duration: data.routes[0].duration,
      geometry: data.routes[0].geometry
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
