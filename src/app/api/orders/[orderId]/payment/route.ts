import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { sendEmail, mailTemplates } from "@/lib/mail";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    
    // Fetch order and user for notification
    const orderBefore = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!orderBefore) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shippingMethod = formData.get("shippingMethod") as string;
    const status = formData.get("status") as string;

    if (!file || !shippingMethod) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Save Receipt File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = path.extname(file.name);
    const uniqueFileName = `receipt_${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    // Update Order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        receiptPath: uniqueFileName,
        shippingMethod: shippingMethod,
        status: status,
      },
    });

    // Notify Admin
    try {
      const adminEmail = "gastongrasso@sie.com.ar";
      const template = mailTemplates.adminPaymentUploaded(orderId, orderBefore.user.email, orderBefore.fileName);
      await sendEmail({
        to: adminEmail,
        subject: template.subject,
        html: template.html,
      });
    } catch (adminMailError) {
      console.error("Failed to notify admin of payment upload:", adminMailError);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Payment submission error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
