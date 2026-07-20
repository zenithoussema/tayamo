import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseSearch } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const q = parseSearch(request);

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.shopCategory.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip,
      take: limit,
      include: { _count: { select: { products: true } } },
    }),
    prisma.shopCategory.count({ where }),
  ]);

  return NextResponse.json({ data, total });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { name, slug, description, icon, imageUrl, sortOrder } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  try {
    const category = await prisma.shopCategory.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        icon: icon || null,
        imageUrl: imageUrl || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A category with this name or slug already exists" }, { status: 409 });
    }
    throw error;
  }
}
