import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseSearch } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const search = parseSearch(request);
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");

  const where: Record<string, unknown> = {};

  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { client: { fullName: { contains: search, mode: "insensitive" } } },
      { subject: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { client: { select: { id: true, fullName: true, phone: true } } },
    }),
    prisma.feedback.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { clientId, type, subject, message } = body;

  if (!clientId || !type || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      clientId: Number(clientId),
      type,
      subject,
      message,
    },
    include: { client: { select: { id: true, fullName: true, phone: true } } },
  });

  return NextResponse.json(feedback, { status: 201 });
}
