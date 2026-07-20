import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id: parseInt(id) } });
  if (!news) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(news);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    const body = await request.json();
    const existing = await prisma.news.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.titleAr !== undefined) data.titleAr = body.titleAr || null;
    if (body.content !== undefined) data.content = body.content;
    if (body.contentAr !== undefined) data.contentAr = body.contentAr || null;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl || null;
    if (body.category !== undefined) data.category = body.category;
    if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;

    if (body.isPublished !== undefined) {
      data.isPublished = body.isPublished;
      if (body.isPublished && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
      if (!body.isPublished) {
        data.publishedAt = null;
      }
    }

    const news = await prisma.news.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  try {
    await prisma.news.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
