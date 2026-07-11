import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const activities = await prisma.activity.findMany({
    orderBy: { nameFr: "asc" },
    select: {
      id: true,
      nameFr: true,
      nameAr: true,
      slug: true,
      coverImageUrl: true,
      _count: { select: { bookings: true, schedules: true } },
    },
  });

  return NextResponse.json(activities);
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
