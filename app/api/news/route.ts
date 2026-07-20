import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const category = url.searchParams.get("category");

    const where: Record<string, unknown> = { isPublished: true };
    if (category && category !== "all") {
      where.category = category;
    }

    const news = await prisma.news.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
