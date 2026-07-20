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

  const category = await prisma.shopCategory.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
      products: { select: { id: true, name: true, slug: true }, take: 10 },
    },
  });

  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const existing = await prisma.shopCategory.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const body = await request.json();
  const { name, slug, description, icon, imageUrl, sortOrder, isActive } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (description !== undefined) data.description = description;
  if (icon !== undefined) data.icon = icon;
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (isActive !== undefined) data.isActive = isActive;

  try {
    const updated = await prisma.shopCategory.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
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

  const existing = await prisma.shopCategory.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  // Parse body for force/move options
  let body: { force?: boolean; moveToCategoryId?: number } = {};
  try {
    body = await request.json();
  } catch {}

  if (existing._count.products > 0) {
    // If force delete: delete all products in this category first
    if (body.force) {
      await prisma.shopProduct.deleteMany({ where: { categoryId: id } });
      await prisma.shopCategory.delete({ where: { id } });
      return NextResponse.json({
        message: `Category deleted with ${existing._count.products} product(s)`,
        deletedProducts: existing._count.products,
      });
    }

    // If move: reassign products to another category
    if (body.moveToCategoryId) {
      const targetExists = await prisma.shopCategory.findUnique({ where: { id: body.moveToCategoryId } });
      if (!targetExists) {
        return NextResponse.json({ error: "Target category not found" }, { status: 404 });
      }
      if (body.moveToCategoryId === id) {
        return NextResponse.json({ error: "Cannot move products to the same category" }, { status: 400 });
      }

      await prisma.shopProduct.updateMany({
        where: { categoryId: id },
        data: { categoryId: body.moveToCategoryId },
      });
      await prisma.shopCategory.delete({ where: { id } });
      return NextResponse.json({
        message: `Category deleted. ${existing._count.products} product(s) moved to "${targetExists.name}".`,
        movedProducts: existing._count.products,
        movedTo: targetExists.name,
      });
    }

    // No action specified: return product count info
    const productNames = await prisma.shopProduct.findMany({
      where: { categoryId: id },
      select: { name: true },
      take: 10,
    });
    return NextResponse.json({
      error: "has_products",
      productCount: existing._count.products,
      products: productNames.map((p) => p.name),
      message: `This category has ${existing._count.products} product(s). Choose an action.`,
    }, { status: 409 });
  }

  // No products: safe to delete
  await prisma.shopCategory.delete({ where: { id } });
  return NextResponse.json({ message: "Category deleted" });
}
