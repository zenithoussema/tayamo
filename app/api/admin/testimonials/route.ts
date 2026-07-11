import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseSearch, parseFilter } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const search = parseSearch(request);
  const filters = parseFilter(request);

  const where: Record<string, unknown> = {};

  if (filters.approved !== undefined) where.approved = filters.approved === "true";
  if (search) {
    where.OR = [
      { authorName: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [testimonials, total] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.testimonial.count({ where }),
  ]);

  return NextResponse.json({ data: testimonials, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { authorName, content, rating, approved } = body;

  if (!authorName || !content || !rating) {
    return NextResponse.json({ error: "Author name, content, and rating are required" }, { status: 400 });
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      authorName,
      content,
      rating: Number(rating),
      approved: !!approved,
    },
  });

  return NextResponse.json(testimonial, { status: 201 });
}
