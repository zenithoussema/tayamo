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
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { nameFr: { contains: q, mode: "insensitive" } },
      { nameAr: { contains: q, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { nameFr: "asc" },
      skip,
      take: limit,
      select: {
        id: true,
        nameFr: true,
        nameAr: true,
        slug: true,
        coverImageUrl: true,
        isActive: true,
        descriptionFr: true,
        descriptionAr: true,
        ageRangeMin: true,
        ageRangeMax: true,
        iconName: true,
        createdAt: true,
        _count: { select: { bookings: true, schedules: true } },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  return NextResponse.json({ data, total });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { nameFr, nameAr, slug, descriptionFr, descriptionAr, ageRangeMin, ageRangeMax, iconName, coverImageUrl } = body;

  if (!nameFr || !nameAr || !descriptionFr || !descriptionAr) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const finalSlug = slug || nameFr.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  try {
    const activity = await prisma.activity.create({
      data: {
        nameFr,
        nameAr,
        slug: finalSlug,
        descriptionFr,
        descriptionAr,
        ageRangeMin: ageRangeMin ?? 4,
        ageRangeMax: ageRangeMax ?? 99,
        iconName: iconName || null,
        coverImageUrl: coverImageUrl || null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw error;
  }
}
