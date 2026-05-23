import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const instagramNick = typeof body.instagramNick === "string" ? body.instagramNick.trim().replace(/^@/, "") : "";

  if (!instagramNick) {
    return NextResponse.json({ error: "Missing instagramNick" }, { status: 400 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        instagramNick,
        status: "NEW",
      },
    });
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error("Create order error:", err.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
