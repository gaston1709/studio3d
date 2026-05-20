import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { orderId } = await params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order || !order.receiptPath) {
      return new NextResponse("Receipt not found", { status: 404 });
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    const isOwner = order.user.email === session.user.email;

    if (!isAdmin && !isOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const filePath = path.join(process.cwd(), "uploads", order.receiptPath);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="receipt_${order.id}.png"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
