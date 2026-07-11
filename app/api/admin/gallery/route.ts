import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function parseImageMeta(altField: string) {
  try {
    const parsed = JSON.parse(altField);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        alt: parsed.alt ?? "",
        category: parsed.category ?? "Général",
        featured: parsed.featured ?? false,
      };
    }
  } catch {}
  return { alt: altField, category: "Général", featured: false };
}

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);

  const [images, total] = await Promise.all([
    prisma.galleryImage.findMany({
      orderBy: { sortOrder: "asc" },
      skip,
      take: limit,
    }),
    prisma.galleryImage.count(),
  ]);

  const enriched = images.map((img) => {
    const meta = parseImageMeta(img.alt);
    return {
      id: img.id,
      url: img.url,
      alt: meta.alt,
      category: meta.category,
      featured: meta.featured,
      sortOrder: img.sortOrder,
      createdAt: img.createdAt,
    };
  });

  return NextResponse.json({ data: enriched, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { url, alt, category, featured } = body;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const maxOrder = await prisma.galleryImage.aggregate({
    _max: { sortOrder: true },
  });

  const metadata = JSON.stringify({
    alt: alt || "",
    category: category || "Général",
    featured: featured ?? false,
  });

  const image = await prisma.galleryImage.create({
    data: {
      url,
      alt: metadata,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(image, { status: 201 });
}
