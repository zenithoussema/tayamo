import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const sort = url.searchParams.get("sort");
  const featured = url.searchParams.get("featured");
  const isNew = url.searchParams.get("new");
  const bestseller = url.searchParams.get("bestseller");

  const where: Record<string, unknown> = { isActive: true };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  if (featured === "true") where.isFeatured = true;
  if (isNew === "true") where.isNew = true;
  if (bestseller === "true") where.isBestSeller = true;

  let orderBy: Record<string, string>;
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "best-selling":
      orderBy = { reviewCount: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [data, total] = await Promise.all([
    prisma.shopProduct.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { category: { select: { id: true, name: true, slug: true } } },
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
    name,
    slug,
    description,
    shortDesc,
    price,
    compareAtPrice,
    images,
    categoryId,
    brand,
    sku,
    stock,
    isFeatured,
    isNew,
    isBestSeller,
    tags,
    specifications,
  } = body;

  if (!name || !description || price == null || !categoryId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  try {
    const product = await prisma.shopProduct.create({
      data: {
        name,
        slug: finalSlug,
        description,
        shortDesc: shortDesc || null,
        price,
        compareAtPrice: compareAtPrice ?? null,
        images: JSON.stringify(images || []),
        categoryId,
        brand: brand || null,
        sku: sku || null,
        stock: stock ?? 0,
        isFeatured: isFeatured ?? false,
        isNew: isNew ?? false,
        isBestSeller: isBestSeller ?? false,
        tags: JSON.stringify(tags || []),
        specifications: JSON.stringify(specifications || {}),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw error;
  }
}
