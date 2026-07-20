import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId, authorName, rating, content } = body;

  if (!productId || !authorName || !rating || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const product = await prisma.shopProduct.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.shopReview.create({
      data: {
        productId,
        authorName,
        rating,
        content,
        approved: true,
      },
    });

    const stats = await tx.shopReview.aggregate({
      where: { productId, approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.shopProduct.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    return created;
  });

  return NextResponse.json(review, { status: 201 });
}
