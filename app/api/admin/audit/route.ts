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
  const entity = url.searchParams.get("entity");
  const type = url.searchParams.get("type");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const statsOnly = url.searchParams.get("stats") === "true";

  const where: Record<string, unknown> = {};

  if (entity) where.entity = { contains: entity, mode: "insensitive" };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      (where.createdAt as Record<string, Date>).lte = end;
    }
  }
  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { entity: { contains: search, mode: "insensitive" } },
      { details: { contains: search, mode: "insensitive" } },
    ];
  }

  // Type filter
  if (type && type !== "all") {
    const typeConditions: Record<string, Record<string, unknown>> = {
      login: { action: { contains: "login", mode: "insensitive" } },
      delete: { action: { contains: "Deleted", mode: "insensitive" } },
      permission: {
        OR: [
          { action: { contains: "permission", mode: "insensitive" } },
          { action: { contains: "role", mode: "insensitive" } },
        ],
      },
      error: {
        OR: [
          { action: { contains: "error", mode: "insensitive" } },
          { action: { contains: "failed", mode: "insensitive" } },
          { action: { contains: "unauthorized", mode: "insensitive" } },
        ],
      },
      modify: {
        OR: [
          { action: { contains: "Updated", mode: "insensitive" } },
          { action: { contains: "Modified", mode: "insensitive" } },
        ],
      },
    };
    if (typeConditions[type]) {
      Object.assign(where, typeConditions[type]);
    }
  }

  if (statsOnly) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalActions,
      actionsToday,
      failedLogins,
      deletedRecords,
      permissionChanges,
      actionsByDay,
      actionsByEntity,
    ] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.auditLog.count({
        where: {
          OR: [
            { action: { contains: "failed", mode: "insensitive" } },
            { action: { contains: "unauthorized", mode: "insensitive" } },
          ],
        },
      }),
      prisma.auditLog.count({
        where: { action: { contains: "Deleted", mode: "insensitive" } },
      }),
      prisma.auditLog.count({
        where: {
          OR: [
            { action: { contains: "permission", mode: "insensitive" } },
            { action: { contains: "role", mode: "insensitive" } },
          ],
        },
      }),
      prisma.auditLog.findMany({
        where: { createdAt: { gte: startOfWeek } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.auditLog.groupBy({
        by: ["entity"],
        _count: true,
        orderBy: { _count: { entity: "desc" } },
      }),
    ]);

    // Actions per day
    const dayMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayMap.set(d.toISOString().split("T")[0], 0);
    }
    actionsByDay.forEach((a) => {
      const key = a.createdAt.toISOString().split("T")[0];
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });
    const actionsPerDay = Array.from(dayMap.entries()).map(([day, count]) => ({ day, count }));

    const actionsByEntityType = actionsByEntity.map((a) => ({ entity: a.entity, count: a._count }));

    return NextResponse.json({
      stats: { totalActions, actionsToday, failedLogins, deletedRecords, permissionChanges },
      actionsPerDay,
      actionsByEntity: actionsByEntityType,
    });
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { id: true, fullName: true, username: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}
