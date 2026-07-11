import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { validatePhone, validateEmail, validateRequired, validateNumber } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id: Number(id) } });
  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(client);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  if (body.fullName !== undefined) {
    const nameCheck = validateRequired(body.fullName, "Nom complet");
    if (!nameCheck.valid) return NextResponse.json({ error: nameCheck.error }, { status: 400 });
  }
  if (body.phone !== undefined) {
    const phoneCheck = validatePhone(body.phone);
    if (!phoneCheck.valid) return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
  }
  if (body.email !== undefined) {
    const emailCheck = validateEmail(body.email);
    if (!emailCheck.valid) return NextResponse.json({ error: emailCheck.error }, { status: 400 });
  }
  if (body.pricePaid !== undefined) {
    const priceCheck = validateNumber(String(body.pricePaid), "Prix", 0);
    if (!priceCheck.valid) return NextResponse.json({ error: priceCheck.error }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.fullName !== undefined) data.fullName = body.fullName;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.activity !== undefined) data.activity = body.activity;
  if (body.subscriptionStartDate !== undefined) data.subscriptionStartDate = new Date(body.subscriptionStartDate);
  if (body.subscriptionDurationDays !== undefined) data.subscriptionDurationDays = body.subscriptionDurationDays;
  if (body.pricePaid !== undefined) data.pricePaid = Number(body.pricePaid);
  if (body.notes !== undefined) data.notes = body.notes || null;

  const client = await prisma.client.update({
    where: { id: Number(id) },
    data,
  });

  logAudit({ action: "Updated member", entity: "Client", entityId: Number(id), details: `Updated member: ${id}` });

  return NextResponse.json(client);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  await prisma.client.delete({ where: { id: Number(id) } });
  logAudit({ action: "Deleted member", entity: "Client", entityId: Number(id), details: `Deleted member: ${id}` });
  return NextResponse.json({ success: true });
}
