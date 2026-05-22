import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "singleton" }
    });
    
    // Return defaults if not created yet
    if (!settings) {
      return NextResponse.json({
        paymentAlias: "3D.PRINT.HUB.CBA",
        paymentCbu: "0000000000000000000000"
      });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentAlias, paymentCbu } = await req.json();

    const settings = await prisma.appSettings.upsert({
      where: { id: "singleton" },
      update: { paymentAlias, paymentCbu },
      create: { id: "singleton", paymentAlias, paymentCbu }
    });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Error updating settings" }, { status: 500 });
  }
}
