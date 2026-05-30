import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(null);
  }

  const order = await prisma.order.findFirst({
    where: {
      user: { email: session.user.email },
      status: "PRINTING",
    },
    include: {
      files: {
        include: { color: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!order) return NextResponse.json(null);

  return NextResponse.json({
    id: order.id,
    fileName: order.files[0]?.fileName ?? "archivo.stl",
    hexColor: order.files[0]?.color?.hexCode ?? null,
  });
}
