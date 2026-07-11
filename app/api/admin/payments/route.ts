import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseSearch } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const search = parseSearch(request);
  const url = new URL(request.url);
  const method = url.searchParams.get("method");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const where: Record<string, unknown> = {};

  if (method) where.method = method;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate);
    if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { client: { fullName: { contains: search, mode: "insensitive" } } },
      { reference: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { client: { select: { id: true, fullName: true, phone: true } } },
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { clientId, amount, method, reference, description } = body;

  if (!clientId || amount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        clientId: Number(clientId),
        amount: Number(amount),
        method: method || "CASH",
        reference: reference || null,
        description: description || null,
      },
      include: { client: { select: { id: true, fullName: true, phone: true } } },
    }),
    prisma.client.update({
      where: { id: Number(clientId) },
      data: { pricePaid: { increment: Number(amount) } },
    }),
  ]);

  logAudit({ action: "Recorded payment", entity: "Payment", entityId: payment.id, details: `Recorded payment: ${amount} TND for client ${clientId}` });

  return NextResponse.json(payment, { status: 201 });
}
