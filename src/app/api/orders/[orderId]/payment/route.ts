import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { sendEmail, mailTemplates } from "@/lib/mail";
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
    
    // Fetch order and user for notification
    const orderBefore = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, files: true }
    });

    if (!orderBefore) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (orderBefore.status === "CANCELLED") {
      return NextResponse.json({ error: "No se puede registrar pago en un pedido cancelado" }, { status: 400 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = orderBefore.user.email === session.user.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const shippingMethod = formData.get("shippingMethod") as string;
    const status = formData.get("status") as string;

    if (!file || !shippingMethod) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Validate receipt size and extension
    const ALLOWED_RECEIPT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const MAX_RECEIPT_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_RECEIPT_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Formato de comprobante no permitido: ${ext}. Solo se admiten: ${ALLOWED_RECEIPT_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_RECEIPT_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo de comprobante supera el límite de 5MB.` },
        { status: 400 }
      );
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
      const displayFileName = orderBefore.files[0]?.fileName || "archivos";
      const template = mailTemplates.adminPaymentUploaded(orderId, orderBefore.user.email, displayFileName);
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
