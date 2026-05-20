import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { sendEmail, mailTemplates } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const email = formData.get("email") as string;

    if (session.user.email !== email) {
      return NextResponse.json({ error: "Forbidden: Session email mismatch" }, { status: 403 });
    }

    // Technical Specs
    const purpose = (formData.get("purpose") as string) || "aesthetic";
    const scaleFactor = (formData.get("scaleFactor") as string) || "100%";

    // Delivery Prefs
    const desiredDate = formData.get("desiredDate") as string;
    const deliveryNotes = formData.get("deliveryNotes") as string;

    if (!files || files.length === 0 || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Find User
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User session not found" }, { status: 401 });
    }

    // 2. Save Files and Configs
    const fileEntries = files.map((file, index) => {
        const configStr = formData.get(`config_${index}`) as string;
        const config = JSON.parse(configStr || "{}");
        return { file, config };
    });

    // Validate files size and extensions
    const ALLOWED_3D_EXTENSIONS = [".stl", ".obj", ".3mf", ".step", ".stp"];
    const MAX_3D_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    for (const entry of fileEntries) {
      const ext = path.extname(entry.file.name).toLowerCase();
      if (!ALLOWED_3D_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Formato de archivo no permitido: ${ext}. Solo se admiten: ${ALLOWED_3D_EXTENSIONS.join(", ")}` },
          { status: 400 }
        );
      }
      if (entry.file.size > MAX_3D_FILE_SIZE) {
        return NextResponse.json(
          { error: `El archivo ${entry.file.name} supera el límite de 50MB.` },
          { status: 400 }
        );
      }
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    const orderFileData: any[] = [];

    for (const entry of fileEntries) {
      const bytes = await entry.file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileExtension = path.extname(entry.file.name);
      const uniqueFileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      await writeFile(filePath, buffer);

      orderFileData.push({
        fileName: entry.file.name,
        filePath: uniqueFileName,
        materialId: (entry.config.materialId === "custom" || entry.config.materialId === "multi" || !entry.config.materialId) ? null : entry.config.materialId,
        colorId: (entry.config.colorId === "custom" || entry.config.colorId === "multi" || !entry.config.colorId) ? null : entry.config.colorId,
        customMaterial: entry.config.customMaterial || null,
        customColor: entry.config.customColor || null,
        infillType: entry.config.infillType || "auto",
        infillPercentage: entry.config.infillPercentage ? parseInt(entry.config.infillPercentage) : null,
        layerHeightType: entry.config.layerHeightType || "standard",
        layerHeightManual: entry.config.layerHeightManual ? parseFloat(entry.config.layerHeightManual) : null,
        scaleFactor: entry.config.scaleFactor || "100%",
      });
    }

    // 3. Create Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "PENDING_QUOTE",
        purpose,
        desiredDate: desiredDate ? new Date(desiredDate) : null,
        deliveryNotes: deliveryNotes || null,
        files: {
            create: orderFileData
        }
      },
      include: {
          files: true
      }
    });

    // 4. Send Notification
    try {
      const firstFileName = order.files[0]?.fileName || "archivos";
      const displayFileName = order.files.length > 1 ? `${firstFileName} (+${order.files.length - 1})` : firstFileName;
      
      const template = mailTemplates.orderReceived(order.id, displayFileName);
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
      const firstFileName = order.files[0]?.fileName || "archivos";
      const displayFileName = order.files.length > 1 ? `${firstFileName} (+${order.files.length - 1})` : firstFileName;

      const adminEmail = "gastongrasso@sie.com.ar";
      const adminTemplate = mailTemplates.adminNewOrder(order.id, email, displayFileName);
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
