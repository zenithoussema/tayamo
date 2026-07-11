import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const records = await prisma.attendance.findMany({
    where: {
      checkIn: { gte: today, lt: tomorrow },
    },
    orderBy: { checkIn: "desc" },
    include: { client: { select: { id: true, fullName: true, phone: true, activity: true } } },
  });

  return NextResponse.json(records);
}
