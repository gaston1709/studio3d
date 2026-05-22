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
      include: { user: true, files: true }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = order.user.email === session.user.email;

    if (!isAdmin && !isOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const index = parseInt(searchParams.get("index") || "0", 10);

    let targetFilePath: string | null = null;
    let targetFileName: string | null = null;

    // 1. Try modern OrderFile relation
    if (order.files.length > 0) {
        if (index >= 0 && index < order.files.length) {
            targetFilePath = order.files[index].filePath;
            targetFileName = order.files[index].fileName;
        }
    } 

    if (!targetFilePath || !targetFileName) {
      return new NextResponse("File not found or index out of bounds", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "uploads", targetFilePath);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${targetFileName}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
