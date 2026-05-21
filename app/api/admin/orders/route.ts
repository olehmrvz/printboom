import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Admin orders error:", err.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
