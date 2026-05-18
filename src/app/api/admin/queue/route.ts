import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { orderIds } = await req.json();

    // Batch update positions
    await prisma.$transaction(
      orderIds.map((id: string, index: number) =>
        prisma.order.update({
          where: { id },
          data: { queuePosition: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Queue update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
