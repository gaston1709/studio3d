import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { sendEmail, mailTemplates } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const email = formData.get("email") as string;
    const materialId = formData.get("materialId") as string;
    const colorId = formData.get("colorId") as string;
    const customMaterial = formData.get("customMaterial") as string;
    const customColor = formData.get("customColor") as string;

    // Technical Specs
    const purpose = formData.get("purpose") as string;
    const infillType = formData.get("infillType") as string;
    const infillPercentage = formData.get("infillPercentage") ? parseInt(formData.get("infillPercentage") as string) : null;
    const layerHeightType = formData.get("layerHeightType") as string;
    const layerHeightManual = formData.get("layerHeightManual") ? parseFloat(formData.get("layerHeightManual") as string) : null;

    // Delivery Prefs
    const desiredDate = formData.get("desiredDate") as string;
    const deliveryNotes = formData.get("deliveryNotes") as string;

    if (!file || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Find User
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User session not found" }, { status: 401 });
    }

    // 2. Save File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    // 3. Create Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        materialId: materialId === "custom" ? null : materialId,
        colorId: (materialId === "custom" || colorId === "custom") ? null : colorId,
        customMaterial: customMaterial || null,
        customColor: customColor || null,
        fileName: file.name,
        filePath: uniqueFileName,
        status: "PENDING_QUOTE",
        
        // Technical Specs
        purpose,
        infillType,
        infillPercentage,
        layerHeightType,
        layerHeightManual,

        // Delivery Prefs
        desiredDate: desiredDate ? new Date(desiredDate) : null,
        deliveryNotes: deliveryNotes || null,
      },
    });

    // 4. Send Notification
    try {
      const template = mailTemplates.orderReceived(order.id, order.fileName);
      await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      });
    } catch (mailError) {
      console.error("Failed to send order received email:", mailError);
    }

    // 5. Admin Notification
    try {
      const adminEmail = "gastongrasso@sie.com.ar";
      const adminTemplate = mailTemplates.adminNewOrder(order.id, email, order.fileName);
      await sendEmail({
        to: adminEmail,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      });
    } catch (adminMailError) {
      console.error("Failed to notify admin of new order:", adminMailError);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Order submission error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
