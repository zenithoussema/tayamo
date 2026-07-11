import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        activity: { select: { id: true, nameFr: true, nameAr: true } },
        schedule: { select: { id: true, dayOfWeek: true, startTime: true, endTime: true, coachName: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data,
      include: {
        activity: { select: { id: true, nameFr: true, nameAr: true } },
        schedule: { select: { id: true, dayOfWeek: true, startTime: true, endTime: true, coachName: true } },
      },
    });
    logAudit({ action: "Updated booking status", entity: "Booking", entityId: Number(id), details: `Updated booking status: ${id} → ${body.status}` });
    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    await prisma.booking.delete({ where: { id: Number(id) } });
    logAudit({ action: "Deleted booking", entity: "Booking", entityId: Number(id), details: `Deleted booking: ${id}` });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
