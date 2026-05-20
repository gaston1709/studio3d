import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
