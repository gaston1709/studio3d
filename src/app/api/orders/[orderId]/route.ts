import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, mailTemplates } from "@/lib/mail";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    
    // Fetch current order to check for status transitions
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await req.json();
    const { price, printTimeEstimated, status, estimatedDelivery } = body;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        price,
        printTimeEstimated,
        status,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      },
    });

    // Email Triggers based on status transitions
    if (status && status !== currentOrder.status) {
      let template;
      
      switch (status) {
        case "QUOTED":
          if (price) {
            template = mailTemplates.orderQuoted(orderId, updatedOrder.fileName, price);
          }
          break;
        case "ACCEPTED":
          template = mailTemplates.orderInQueue(orderId, updatedOrder.fileName);
          break;
        case "PRINTING":
          template = mailTemplates.orderPrinting(orderId, updatedOrder.fileName);
          break;
        case "SHIPPED":
          template = mailTemplates.orderReady(orderId, updatedOrder.fileName);
          break;
      }

      if (template && currentOrder.user.email) {
        try {
          await sendEmail({
            to: currentOrder.user.email,
            subject: template.subject,
            html: template.html,
          });
        } catch (mailError) {
          console.error(`Failed to send ${status} email:`, mailError);
        }
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
