import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.checkOut === true) data.checkOut = new Date();

  const attendance = await prisma.attendance.update({
    where: { id: Number(id) },
    data,
    include: { client: { select: { id: true, fullName: true, phone: true } } },
  });

  logAudit({ action: "Member check-out", entity: "Attendance", entityId: Number(id), details: `Member check-out: ${id}` });

  return NextResponse.json(attendance);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  await prisma.attendance.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
