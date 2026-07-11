import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const activities = await prisma.activity.findMany({
    where: { isActive: true },
    select: { id: true, nameFr: true, slug: true },
    orderBy: { nameFr: "asc" },
  });

  return NextResponse.json(activities);
}
