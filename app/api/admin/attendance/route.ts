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
    where.checkIn = {};
    if (startDate) (where.checkIn as Record<string, Date>).gte = new Date(startDate);
    if (endDate) (where.checkIn as Record<string, Date>).lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { client: { fullName: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      orderBy: { checkIn: "desc" },
      skip,
      take: limit,
      include: { client: { select: { id: true, fullName: true, phone: true } } },
    }),
    prisma.attendance.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { clientId, method } = body;

  if (!clientId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const attendance = await prisma.attendance.create({
    data: {
      clientId: Number(clientId),
      method: method || "MANUAL",
    },
    include: { client: { select: { id: true, fullName: true, phone: true } } },
  });

  logAudit({ action: "Member check-in", entity: "Attendance", entityId: attendance.id, details: `Member check-in: client ${clientId}` });

  return NextResponse.json(attendance, { status: 201 });
}
