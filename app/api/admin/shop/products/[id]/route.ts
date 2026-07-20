import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const product = await prisma.shopProduct.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
  });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const existing = await prisma.shopProduct.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await request.json();
  const {
    name, slug, description, shortDesc, productType, price, compareAtPrice,
    images, categoryId, brand, sku, weight, stock,
    isFeatured, isNew, isBestSeller, isActive,
    tags, sizes, colors, specifications,
  } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (description !== undefined) data.description = description;
  if (shortDesc !== undefined) data.shortDesc = shortDesc;
  if (productType !== undefined) data.productType = productType;
  if (price !== undefined) data.price = parseFloat(price);
  if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
  if (images !== undefined) data.images = JSON.stringify(images);
  if (categoryId !== undefined) data.categoryId = parseInt(categoryId);
  if (brand !== undefined) data.brand = brand;
  if (sku !== undefined) data.sku = sku;
  if (weight !== undefined) data.weight = weight ? parseFloat(weight) : null;
  if (stock !== undefined) data.stock = parseInt(stock);
  if (isFeatured !== undefined) data.isFeatured = isFeatured;
  if (isNew !== undefined) data.isNew = isNew;
  if (isBestSeller !== undefined) data.isBestSeller = isBestSeller;
  if (isActive !== undefined) data.isActive = isActive;
  if (tags !== undefined) data.tags = JSON.stringify(tags);
  if (sizes !== undefined) data.sizes = JSON.stringify(sizes);
  if (colors !== undefined) data.colors = JSON.stringify(colors);
  if (specifications !== undefined) data.specifications = JSON.stringify(specifications);

  try {
    const updated = await prisma.shopProduct.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const existing = await prisma.shopProduct.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });

  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  if (existing._count.orderItems > 0) {
    return NextResponse.json({ error: "Cannot delete product with existing orders. Consider hiding it instead." }, { status: 409 });
  }

  await prisma.shopProduct.delete({ where: { id } });
  return NextResponse.json({ message: "Product deleted" });
}
