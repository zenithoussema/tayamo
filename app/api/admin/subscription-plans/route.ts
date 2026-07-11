import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseSearch } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const search = parseSearch(request);

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [plans, total] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.subscriptionPlan.count({ where }),
  ]);

  return NextResponse.json({ data: plans, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { name, price, durationDays, features, isActive } = body;

  if (!name || price === undefined || !durationDays) {
    return NextResponse.json({ error: "Name, price, and duration are required" }, { status: 400 });
  }

  const plan = await prisma.subscriptionPlan.create({
    data: {
      name,
      price: Number(price),
      durationDays: Number(durationDays),
      features: JSON.stringify(features || []),
      isActive: isActive !== false,
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
