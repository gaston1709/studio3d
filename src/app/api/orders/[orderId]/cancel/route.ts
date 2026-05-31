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
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isClient = session.user.role !== "ADMIN";

    if (isClient) {
      // Clients can only cancel their own orders
      if (order.user.email !== session.user.email) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Check if order is in a cancelable state for client
      const cancelableStatuses = ["PENDING_QUOTE", "QUOTED", "PAYMENT_PENDING_VERIFICATION", "ACCEPTED"];
      if (!cancelableStatuses.includes(order.status)) {
        return NextResponse.json(
          { error: "No se puede cancelar un pedido que ya está en proceso de impresión o finalizado." },
          { status: 400 }
        );
      }
    }

    // Update status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Order cancel error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
