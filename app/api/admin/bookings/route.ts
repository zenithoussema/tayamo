import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseSearch, parseSort, parseFilter } from "@/lib/admin-auth";
import { validatePhone, validateRequired } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const search = parseSearch(request);
  const orderBy = parseSort(request, ["createdAt", "status", "parentName"]);
  const filters = parseFilter(request);

  const where: Record<string, unknown> = {};

  if (filters.status) where.status = filters.status;
  if (filters.activityId) where.activityId = parseInt(filters.activityId);
  if (search) {
    where.OR = [
      { parentName: { contains: search, mode: "insensitive" } },
      { childName: { contains: search, mode: "insensitive" } },
      { parentPhone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        activity: { select: { id: true, nameFr: true, nameAr: true } },
        schedule: { select: { id: true, dayOfWeek: true, startTime: true, endTime: true, coachName: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({ data: bookings, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { parentName, parentPhone, childName, activityId } = body;

  const nameCheck = validateRequired(parentName, "Nom du parent");
  if (!nameCheck.valid) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

  const phoneCheck = validatePhone(parentPhone);
  if (!phoneCheck.valid) return NextResponse.json({ error: phoneCheck.error }, { status: 400 });

  const childCheck = validateRequired(childName, "Nom de l'enfant");
  if (!childCheck.valid) return NextResponse.json({ error: childCheck.error }, { status: 400 });

  const activityCheck = validateRequired(String(activityId), "Activité");
  if (!activityCheck.valid) return NextResponse.json({ error: activityCheck.error }, { status: 400 });

  const booking = await prisma.booking.create({
    data: {
      parentName,
      parentPhone,
      childName,
      activityId: Number(activityId),
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
