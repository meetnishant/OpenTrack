import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// This endpoint allows admins to generate new API keys for external clients
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, scope } = data;

    if (!name) {
      return NextResponse.json({ error: "Name is required for the API Key" }, { status: 400 });
    }

    // Generate a secure random token
    const rawKey = crypto.randomBytes(32).toString("hex");
    const keyString = `opntrk_${rawKey}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        key: keyString,
        name,
        scope: scope || "read"
      }
    });

    return NextResponse.json({ 
      success: true, 
      key: apiKey.key, 
      name: apiKey.name,
      scope: apiKey.scope,
      message: "Please save this key securely. It will not be shown again."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Only return metadata, NEVER the raw keys for security
    const keys = await prisma.apiKey.findMany({
      select: {
        id: true,
        name: true,
        scope: true,
        createdAt: true,
        lastUsed: true
      }
    });
    return NextResponse.json(keys);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) return NextResponse.json({ error: "Missing key ID" }, { status: 400 });

    await prisma.apiKey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
