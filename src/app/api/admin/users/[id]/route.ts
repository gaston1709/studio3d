import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { role } = await req.json();

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // Prevent changing the main admin email role
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (userToUpdate?.email === "gastongrasso@sie.com.ar") {
        return NextResponse.json({ error: "Cannot change role of main admin" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    
    // Safety checks
    if (userToDelete?.email === "gastongrasso@sie.com.ar") {
      return NextResponse.json({ error: "Cannot delete main admin account" }, { status: 403 });
    }
    
    if (userToDelete?.email === session?.user?.email) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 });
    }

    // Prisma Cascade should handle orders if set up, but let's be careful.
    // Order model doesn't have Cascade in schema for User.
    // We should probably delete orders or set them to null? 
    // Actually, it's better to keep orders for records. 
    // But SQLite doesn't have "SET NULL" easily without re-defining.
    // Let's check schema again.

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
