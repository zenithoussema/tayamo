import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const q = url.searchParams.get("q") || "";
  const categoryId = url.searchParams.get("categoryId");
  const brand = url.searchParams.get("brand");
  const status = url.searchParams.get("status");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId);
  }

  if (brand) {
    where.brand = { contains: brand, mode: "insensitive" };
  }

  if (status === "active") {
    where.isActive = true;
    where.stock = { gt: 0 };
  } else if (status === "out_of_stock") {
    where.isActive = true;
    where.stock = 0;
  } else if (status === "hidden") {
    where.isActive = false;
  } else if (status === "featured") {
    where.isFeatured = true;
    where.isActive = true;
  } else if (status === "new") {
    where.isNew = true;
    where.isActive = true;
  } else if (status === "best_seller") {
    where.isBestSeller = true;
    where.isActive = true;
  }

  const [data, total] = await Promise.all([
    prisma.shopProduct.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.shopProduct.count({ where }),
  ]);

  return NextResponse.json({ data, total });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const {
    name, slug, description, shortDesc, productType, price, compareAtPrice,
    images, categoryId, brand, sku, weight, stock,
    isFeatured, isNew, isBestSeller, isActive,
    tags, sizes, colors, specifications,
  } = body;

  if (!name || !description || price === undefined || !categoryId) {
    return NextResponse.json({ error: "Missing required fields: name, description, price, categoryId" }, { status: 400 });
  }

  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  try {
    const product = await prisma.shopProduct.create({
      data: {
        name,
        slug: finalSlug,
        description,
        shortDesc: shortDesc || null,
        productType: productType || null,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        images: JSON.stringify(images || []),
        categoryId: parseInt(categoryId),
        brand: brand || null,
        sku: sku || null,
        weight: weight ? parseFloat(weight) : null,
        stock: parseInt(stock) || 0,
        isFeatured: isFeatured || false,
        isNew: isNew || false,
        isBestSeller: isBestSeller || false,
        isActive: isActive !== false,
        tags: JSON.stringify(tags || []),
        sizes: JSON.stringify(sizes || []),
        colors: JSON.stringify(colors || []),
        specifications: JSON.stringify(specifications || {}),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    throw error;
  }
}
