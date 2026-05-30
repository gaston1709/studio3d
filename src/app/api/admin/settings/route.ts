import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = getSettings();
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

    const { paymentAlias, paymentCbu, shippingOptions } = await req.json();

    const settings = saveSettings({ paymentAlias, paymentCbu, shippingOptions });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Error updating settings" }, { status: 500 });
  }
}
