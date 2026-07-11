import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const image = await prisma.galleryImage.findUnique({ where: { id: Number(id) } });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let meta = { alt: image.alt, category: "Général", featured: false };
  try {
    const parsed = JSON.parse(image.alt);
    if (typeof parsed === "object" && parsed !== null) {
      meta = { alt: parsed.alt ?? "", category: parsed.category ?? "Général", featured: parsed.featured ?? false };
    }
  } catch {}

  return NextResponse.json({ ...image, alt: meta.alt, category: meta.category, featured: meta.featured });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.url !== undefined) data.url = body.url;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  if (body.alt !== undefined || body.category !== undefined || body.featured !== undefined) {
    let existing = "";
    try {
      const img = await prisma.galleryImage.findUnique({ where: { id: Number(id) }, select: { alt: true } });
      if (img) existing = img.alt;
    } catch {}

    let meta: { alt: string; category: string; featured: boolean } = { alt: "", category: "Général", featured: false };
    try {
      const parsed = JSON.parse(existing);
      if (typeof parsed === "object" && parsed !== null) meta = { alt: parsed.alt ?? "", category: parsed.category ?? "Général", featured: parsed.featured ?? false };
    } catch {
      meta = { alt: existing, category: "Général", featured: false };
    }

    if (body.alt !== undefined) meta.alt = body.alt;
    if (body.category !== undefined) meta.category = body.category;
    if (body.featured !== undefined) meta.featured = body.featured;

    data.alt = JSON.stringify(meta);
  }

  try {
    const image = await prisma.galleryImage.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(image);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    await prisma.galleryImage.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
