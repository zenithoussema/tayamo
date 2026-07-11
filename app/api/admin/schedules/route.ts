import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseFilter } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const filters = parseFilter(request);

  const where: Record<string, unknown> = {};
  if (filters.activityId) where.activityId = parseInt(filters.activityId);
  if (filters.coachId) where.coachId = parseInt(filters.coachId);
  if (filters.dayOfWeek) where.dayOfWeek = filters.dayOfWeek;
  if (filters.category) where.category = filters.category;
  if (filters.season) where.season = filters.season;
  if (filters.isActive !== undefined) where.isActive = filters.isActive === "true";

  const [schedules, total] = await Promise.all([
    prisma.schedule.findMany({
      where,
      orderBy: { dayOfWeek: "asc" },
      skip,
      take: limit,
      include: {
        activity: { select: { nameFr: true, nameAr: true, slug: true } },
        coach: { select: { name: true } },
      },
    }),
    prisma.schedule.count({ where }),
  ]);

  return NextResponse.json({ data: schedules, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { activityId, coachId, dayOfWeek, startTime, endTime, coachName, category, season } = body;

  if (!activityId || !dayOfWeek || !startTime || !endTime || !coachName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const schedule = await prisma.schedule.create({
    data: {
      activityId: Number(activityId),
      coachId: coachId ? Number(coachId) : null,
      dayOfWeek,
      startTime,
      endTime,
      coachName,
      category: category || "ADULTS",
      season: season || "SUMMER",
      isActive: true,
    },
    include: {
      activity: { select: { nameFr: true, nameAr: true, slug: true } },
      coach: { select: { name: true } },
    },
  });

  return NextResponse.json(schedule, { status: 201 });
}
