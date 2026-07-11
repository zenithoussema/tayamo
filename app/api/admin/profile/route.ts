import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  return NextResponse.json({
    username: "admin",
    role: "Administrator",
    gymName: "Tayamo Sport",
  });
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
  }

  if (currentPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    message: "Password change requires environment variable update. Please update ADMIN_PASSWORD in .env and restart the server.",
  });
}
