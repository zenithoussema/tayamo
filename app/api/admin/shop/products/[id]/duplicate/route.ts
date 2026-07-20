import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const original = await prisma.shopProduct.findUnique({ where: { id } });
  if (!original) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const duplicate = await prisma.shopProduct.create({
    data: {
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      description: original.description,
      shortDesc: original.shortDesc,
      productType: original.productType,
      price: original.price,
      compareAtPrice: original.compareAtPrice,
      images: original.images,
      categoryId: original.categoryId,
      brand: original.brand,
      sku: original.sku ? `${original.sku}-COPY` : null,
      weight: original.weight,
      stock: 0,
      rating: 0,
      reviewCount: 0,
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      isActive: false,
      tags: original.tags,
      sizes: original.sizes,
      colors: original.colors,
      specifications: original.specifications,
    },
  });

  return NextResponse.json(duplicate, { status: 201 });
}
