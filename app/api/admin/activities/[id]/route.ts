import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      _count: { select: { bookings: true, schedules: true } },
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  return NextResponse.json(activity);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.activity.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  const body = await request.json();
  const { nameFr, nameAr, descriptionFr, descriptionAr, slug, ageRangeMin, ageRangeMax, iconName, coverImageUrl, isActive } = body;

  const data: Record<string, unknown> = {};
  if (nameFr !== undefined) data.nameFr = nameFr;
  if (nameAr !== undefined) data.nameAr = nameAr;
  if (descriptionFr !== undefined) data.descriptionFr = descriptionFr;
  if (descriptionAr !== undefined) data.descriptionAr = descriptionAr;
  if (slug !== undefined) data.slug = slug;
  if (ageRangeMin !== undefined) data.ageRangeMin = ageRangeMin;
  if (ageRangeMax !== undefined) data.ageRangeMax = ageRangeMax;
  if (iconName !== undefined) data.iconName = iconName;
  if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;
  if (isActive !== undefined) data.isActive = isActive;

  try {
    const updated = await prisma.activity.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.activity.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  if (existing._count.bookings > 0) {
    return NextResponse.json({ error: "Cannot delete activity with existing bookings" }, { status: 409 });
  }

  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ message: "Activity deleted" });
}
