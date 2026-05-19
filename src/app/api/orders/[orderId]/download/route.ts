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
      include: { files: true }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
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
    // 2. Fallback to legacy comma-separated fields
    else if (order.filePath && order.fileName) {
        const filePaths = order.filePath.split(",");
        const fileNames = order.fileName.split(",");
        if (index >= 0 && index < filePaths.length) {
            targetFilePath = filePaths[index];
            targetFileName = fileNames[index];
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
