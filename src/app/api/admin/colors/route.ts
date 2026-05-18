import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, hexCode, materialId, isActive } = await req.json();

    let result;
    if (id) {
      // Update
      result = await prisma.color.update({
        where: { id },
        data: { 
          ...(name !== undefined && { name }),
          ...(hexCode !== undefined && { hexCode }),
          ...(isActive !== undefined && { isActive }),
        },
      });
    } else {
      // Create
      result = await prisma.color.create({
        data: { name, hexCode, materialId, isActive: isActive ?? true },
      });
    }

    revalidatePath("/admin/materials");
    revalidatePath("/");
    revalidatePath("/orders/new");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Color Error:", error);
    return NextResponse.json({ error: "Error al procesar color" }, { status: 500 });
  }
}
