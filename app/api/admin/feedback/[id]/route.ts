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
  if (body.status !== undefined) data.status = body.status;
  if (body.reply !== undefined) data.reply = body.reply || null;

  const feedback = await prisma.feedback.update({
    where: { id: Number(id) },
    data,
    include: { client: { select: { id: true, fullName: true, phone: true } } },
  });

  logAudit({ action: "Updated feedback status", entity: "Feedback", entityId: Number(id), details: `Updated feedback status: ${id} → ${body.status}` });

  return NextResponse.json(feedback);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  await prisma.feedback.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
