import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { ids } = body;

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids array is required" }, { status: 400 });
  }

  const updates = ids.map((id: number, index: number) =>
    prisma.galleryImage.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  await Promise.all(updates);

  return NextResponse.json({ success: true });
}
