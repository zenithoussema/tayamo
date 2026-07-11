import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      activity: { select: { nameFr: true, nameAr: true, slug: true } },
      coach: { select: { name: true } },
    },
  });

  if (!schedule) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  return NextResponse.json(schedule);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.schedule.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  const body = await request.json();
  const { activityId, coachId, dayOfWeek, startTime, endTime, coachName, category, season, isActive } = body;

  const data: Record<string, unknown> = {};
  if (activityId !== undefined) data.activityId = Number(activityId);
  if (coachId !== undefined) data.coachId = coachId ? Number(coachId) : null;
  if (dayOfWeek !== undefined) data.dayOfWeek = dayOfWeek;
  if (startTime !== undefined) data.startTime = startTime;
  if (endTime !== undefined) data.endTime = endTime;
  if (coachName !== undefined) data.coachName = coachName;
  if (category !== undefined) data.category = category;
  if (season !== undefined) data.season = season;
  if (isActive !== undefined) data.isActive = isActive;

  const updated = await prisma.schedule.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.schedule.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  await prisma.schedule.delete({ where: { id } });
  return NextResponse.json({ message: "Schedule deleted" });
}
