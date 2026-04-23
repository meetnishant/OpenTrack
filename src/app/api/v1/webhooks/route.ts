import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hooks = await prisma.webhook.findMany();
    return NextResponse.json(hooks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { url, events } = data;

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Missing url or events array" }, { status: 400 });
    }

    const hook = await prisma.webhook.create({
      data: { url, events, active: true }
    });

    return NextResponse.json(hook);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.webhook.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
