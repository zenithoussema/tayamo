import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseSort } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const orderBy = parseSort(request, ["createdAt", "publishedAt", "title"]);

  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (category && category !== "all") {
    where.category = category;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.news.findMany({ where, orderBy, skip, take: limit }),
    prisma.news.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, titleAr, content, contentAr, imageUrl, videoUrl, category, isPublished, isFeatured } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const news = await prisma.news.create({
      data: {
        title,
        titleAr: titleAr || null,
        content,
        contentAr: contentAr || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        category: category || "NEWS",
        isPublished: isPublished ?? false,
        isFeatured: isFeatured ?? false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
}
