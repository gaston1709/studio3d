import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await req.json();
    const { rating, ratingComment } = body;

    // Validate rating
    const ratingInt = parseInt(rating);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return NextResponse.json({ error: "Calificación inválida. Debe ser entre 1 y 5." }, { status: 400 });
    }

    // Fetch the order to ensure it exists and belongs to the user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Check ownership
    const isOwner = order.user.email === session.user.email;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if status is DELIVERED
    if (order.status !== "DELIVERED") {
      return NextResponse.json({ error: "Solo se pueden calificar pedidos entregados" }, { status: 400 });
    }

    // Update order with rating
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        rating: ratingInt,
        ratingComment: ratingComment || null,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
