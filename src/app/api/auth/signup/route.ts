import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendEmail, mailTemplates } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email, password, phone, name } = await req.json();

    if (!email || !password || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.password) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      // Update "shadow" account to full account
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          phone,
          name,
          role: "CLIENT",
        },
      });
    } else {
      // Create new account
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          phone,
          name,
          role: "CLIENT",
        },
      });
    }

    // Send Welcome Email
    try {
      const template = mailTemplates.welcome(name);
      await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      });
    } catch (mailError) {
      console.error("Failed to send welcome email:", mailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
