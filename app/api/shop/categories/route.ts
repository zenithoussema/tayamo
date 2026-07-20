import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.shopCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          products: { where: { isActive: true } },
        },
      },
    },
  });

  const data = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    imageUrl: c.imageUrl,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
  }));

  return NextResponse.json({ data });
}
