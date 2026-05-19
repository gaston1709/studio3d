import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const images = await prisma.carouselImage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExtension = path.extname(file.name);
    const uniqueFileName = `carousel_${crypto.randomUUID()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "carousel");
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)){
        await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const image = await prisma.carouselImage.create({
      data: {
        fileName: uniqueFileName,
        caption: caption || null,
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error("Carousel upload error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
