import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  if (!q.trim()) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const where = {
    isActive: true,
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
      { brand: { contains: q, mode: "insensitive" as const } },
      { tags: { contains: q, mode: "insensitive" as const } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.shopProduct.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.shopProduct.count({ where }),
  ]);

  return NextResponse.json({ data, total });
}
