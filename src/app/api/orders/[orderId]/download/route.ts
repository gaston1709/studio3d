import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const index = parseInt(searchParams.get("index") || "0", 10);

    const filePaths = order.filePath.split(",");
    const fileNames = order.fileName.split(",");

    if (index < 0 || index >= filePaths.length) {
      return new NextResponse("File index out of bounds", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "uploads", filePaths[index]);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileNames[index]}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
