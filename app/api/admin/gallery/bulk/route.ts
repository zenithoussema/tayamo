import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { ids } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array is required" }, { status: 400 });
  }

  await prisma.galleryImage.deleteMany({
    where: { id: { in: ids.map(Number) } },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { updates } = body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "updates array is required" }, { status: 400 });
  }

  const operations = updates.map((u: { id: number; alt?: string; category?: string; featured?: boolean }) => {
    const metadata: Record<string, unknown> = {};
    if (u.alt !== undefined) metadata.alt = u.alt;
    if (u.category !== undefined) metadata.category = u.category;
    if (u.featured !== undefined) metadata.featured = u.featured;

    return prisma.galleryImage.update({
      where: { id: u.id },
      data: { alt: JSON.stringify(metadata) },
    });
  });

  await Promise.all(operations);

  return NextResponse.json({ success: true });
}
