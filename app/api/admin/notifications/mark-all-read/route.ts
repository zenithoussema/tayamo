import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const result = await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true, count: result.count });
}
