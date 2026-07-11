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
  const payment = await prisma.payment.findUnique({
    where: { id: Number(id) },
    include: { client: { select: { id: true, fullName: true, phone: true } } },
  });
  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(payment);
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
  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.method !== undefined) data.method = body.method;
  if (body.reference !== undefined) data.reference = body.reference || null;
  if (body.description !== undefined) data.description = body.description || null;

  const payment = await prisma.payment.update({
    where: { id: Number(id) },
    data,
    include: { client: { select: { id: true, fullName: true, phone: true } } },
  });

  return NextResponse.json(payment);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  await prisma.payment.delete({ where: { id: Number(id) } });
  logAudit({ action: "Deleted payment", entity: "Payment", entityId: Number(id), details: `Deleted payment: ${id}` });
  return NextResponse.json({ success: true });
}
