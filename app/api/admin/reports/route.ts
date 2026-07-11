import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "members";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.lte = toDate;
  }
  const hasDateFilter = Object.keys(dateFilter).length > 0;

  try {
    switch (type) {
      case "members":
        return await getMembersReport(dateFilter, hasDateFilter);
      case "financial":
        return await getFinancialReport(dateFilter, hasDateFilter);
      case "attendance":
        return await getAttendanceReport(dateFilter, hasDateFilter);
      case "subscriptions":
        return await getSubscriptionsReport();
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Erreur lors de la génération du rapport" }, { status: 500 });
  }
}

async function getMembersReport(dateFilter: Record<string, Date>, hasDateFilter: boolean) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activeMembers, expiredMembers, newThisMonth, allClients] = await Promise.all([
    prisma.client.count({ where: { isActive: true } }),
    prisma.client.count({ where: { isActive: false } }),
    prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.client.findMany({
      where: hasDateFilter ? { createdAt: dateFilter } : undefined,
      select: { createdAt: true, category: true, activity: true },
    }),
  ]);

  // New members per month
  const monthlyMap = new Map<string, number>();
  allClients.forEach((c) => {
    const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
  });
  const newMembersPerMonth = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // Members by category
  const categoryMap = new Map<string, number>();
  allClients.forEach((c) => {
    categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + 1);
  });
  const membersByCategory = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Members by activity
  const activityMap = new Map<string, number>();
  allClients.forEach((c) => {
    activityMap.set(c.activity, (activityMap.get(c.activity) || 0) + 1);
  });
  const membersByActivity = Array.from(activityMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    stats: { activeMembers, expiredMembers, newThisMonth },
    newMembersPerMonth,
    membersByCategory,
    membersByActivity,
  });
}

async function getFinancialReport(dateFilter: Record<string, Date>, hasDateFilter: boolean) {
  const [allPayments, paymentStats] = await Promise.all([
    prisma.payment.findMany({
      where: hasDateFilter ? { date: dateFilter } : undefined,
      select: { amount: true, method: true, date: true, clientId: true, client: { select: { fullName: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.payment.aggregate({
      where: hasDateFilter ? { date: dateFilter } : undefined,
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
    }),
  ]);

  const totalRevenue = paymentStats._sum.amount || 0;
  const averagePayment = paymentStats._avg.amount || 0;
  const paymentsCount = paymentStats._count;

  // Revenue per month
  const monthlyMap = new Map<string, number>();
  allPayments.forEach((p) => {
    const key = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + p.amount);
  });
  const revenuePerMonth = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }));

  // Revenue by method
  const methodMap = new Map<string, number>();
  allPayments.forEach((p) => {
    methodMap.set(p.method, (methodMap.get(p.method) || 0) + p.amount);
  });
  const revenueByMethod = Array.from(methodMap.entries())
    .map(([method, revenue]) => ({ method, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);

  // Top paying members
  const memberMap = new Map<number, { name: string; total: number; count: number }>();
  allPayments.forEach((p) => {
    const existing = memberMap.get(p.clientId);
    if (existing) {
      existing.total += p.amount;
      existing.count += 1;
    } else {
      memberMap.set(p.clientId, { name: p.client.fullName, total: p.amount, count: 1 });
    }
  });
  const topPayingMembers = Array.from(memberMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((m) => ({ ...m, total: Math.round(m.total * 100) / 100 }));

  return NextResponse.json({
    stats: { totalRevenue: Math.round(totalRevenue * 100) / 100, averagePayment: Math.round(averagePayment * 100) / 100, paymentsCount },
    revenuePerMonth,
    revenueByMethod,
    topPayingMembers,
  });
}

async function getAttendanceReport(dateFilter: Record<string, Date>, hasDateFilter: boolean) {
  const allAttendance = await prisma.attendance.findMany({
    where: hasDateFilter ? { checkIn: dateFilter } : undefined,
    select: { checkIn: true, method: true, clientId: true, client: { select: { fullName: true } } },
  });

  const totalCheckIns = allAttendance.length;
  const daySet = new Set<string>();
  allAttendance.forEach((a) => {
    const d = a.checkIn.toISOString().split("T")[0];
    daySet.add(d);
  });
  const uniqueDays = daySet.size || 1;
  const averagePerDay = Math.round((totalCheckIns / uniqueDays) * 10) / 10;

  // Check-ins per day
  const dailyMap = new Map<string, number>();
  allAttendance.forEach((a) => {
    const key = a.checkIn.toISOString().split("T")[0];
    dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
  });
  const checkInsPerDay = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ day, count }));

  // Peak hours
  const hourMap = new Map<number, number>();
  for (let h = 0; h < 24; h++) hourMap.set(h, 0);
  allAttendance.forEach((a) => {
    const hour = a.checkIn.getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });
  let peakHour = 0;
  let maxCount = 0;
  hourMap.forEach((count, hour) => {
    if (count > maxCount) { maxCount = count; peakHour = hour; }
  });
  const checkInsByHour = Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour: `${String(hour).padStart(2, "0")}:00`, count }));

  // Check-ins by method
  const methodMap = new Map<string, number>();
  allAttendance.forEach((a) => {
    methodMap.set(a.method, (methodMap.get(a.method) || 0) + 1);
  });
  const checkInsByMethod = Array.from(methodMap.entries())
    .map(([method, count]) => ({ method, count }));

  // Most active members
  const memberMap = new Map<number, { name: string; count: number }>();
  allAttendance.forEach((a) => {
    const existing = memberMap.get(a.clientId);
    if (existing) existing.count += 1;
    else memberMap.set(a.clientId, { name: a.client.fullName, count: 1 });
  });
  const mostActiveMembers = Array.from(memberMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({
    stats: { totalCheckIns, averagePerDay, peakHour: `${String(peakHour).padStart(2, "0")}:00` },
    checkInsPerDay,
    checkInsByHour,
    checkInsByMethod,
    mostActiveMembers,
  });
}

async function getSubscriptionsReport() {
  const plans = await prisma.subscriptionPlan.findMany({
    include: { clients: { select: { id: true } } },
  });

  const planData = plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    durationDays: p.durationDays,
    clientCount: p.clients.length,
    revenue: p.price * p.clients.length,
  }));

  const sortedByPopularity = [...planData].sort((a, b) => b.clientCount - a.clientCount);
  const mostPopular = sortedByPopularity.slice(0, 5);
  const leastPopular = [...sortedByPopularity].reverse().slice(0, 5);

  const totalRevenue = planData.reduce((sum, p) => sum + p.revenue, 0);
  const totalClients = planData.reduce((sum, p) => sum + p.clientCount, 0);

  const allPlans = planData.map((p) => ({
    ...p,
    revenue: Math.round(p.revenue * 100) / 100,
    percentage: totalClients > 0 ? Math.round((p.clientCount / totalClients) * 100) : 0,
  }));

  return NextResponse.json({
    stats: {
      totalPlans: plans.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageDuration: plans.length > 0 ? Math.round(plans.reduce((s, p) => s + p.durationDays, 0) / plans.length) : 0,
    },
    mostPopular,
    leastPopular,
    allPlans,
  });
}
