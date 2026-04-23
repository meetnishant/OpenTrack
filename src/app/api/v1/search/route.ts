import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=25.4358&lon=81.8463&limit=5`);
    const data = await res.json();

    return NextResponse.json({
      results: data.features.map((f: any) => ({
        name: f.properties.name,
        city: f.properties.city,
        state: f.properties.state,
        coordinates: f.geometry.coordinates
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
