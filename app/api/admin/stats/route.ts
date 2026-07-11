import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { checkSubscriptionExpirations } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  checkSubscriptionExpirations();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    totalClients,
    totalMessages,
    unreadMessages,
    totalTestimonials,
    pendingTestimonials,
    totalCoaches,
    totalActivities,
    totalGalleryImages,
    totalPlans,
    recentBookings,
    recentMessages,
    totalPayments,
    totalRevenue,
    monthlyRevenue,
    activeClients,
    expiringClients,
    todayAttendances,
    unreadNotifications,
    recentPayments,
    allPaymentsForChartRaw,
    plansWithClients,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.client.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { handled: false } }),
    prisma.testimonial.count(),
    prisma.testimonial.count({ where: { approved: false } }),
    prisma.coach.count(),
    prisma.activity.count(),
    prisma.galleryImage.count(),
    prisma.subscriptionPlan.count(),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        activity: { select: { nameFr: true } },
      },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.payment.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }).then((r) => r._sum.amount ?? 0),
    prisma.payment.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }).then((r) => r._sum.amount ?? 0),
    prisma.client.findMany({
      select: { subscriptionStartDate: true, subscriptionDurationDays: true },
    }).then((clients) => {
      return clients.filter((c) => {
        const end = new Date(c.subscriptionStartDate);
        end.setDate(end.getDate() + c.subscriptionDurationDays);
        return end > now;
      }).length;
    }),
    prisma.client.findMany({
      select: { subscriptionStartDate: true, subscriptionDurationDays: true },
    }).then((clients) => {
      return clients.filter((c) => {
        const end = new Date(c.subscriptionStartDate);
        end.setDate(end.getDate() + c.subscriptionDurationDays);
        return end > now && end <= in7Days;
      }).length;
    }),
    prisma.attendance.count({ where: { checkIn: { gte: startOfToday } } }),
    prisma.notification.count({ where: { read: false } }),
    prisma.payment.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { client: { select: { fullName: true } } },
    }),
    prisma.payment.findMany({
      orderBy: { date: "desc" },
      select: { amount: true, date: true },
    }),
    prisma.subscriptionPlan.findMany({
      include: { clients: { select: { id: true } } },
    }),
  ]);

  const allPaymentsForChart = allPaymentsForChartRaw as Array<{ amount: number; date: Date }>;

  const monthlyRevenueMap = new Map<string, number>();
  const monthsToShow = 12;
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenueMap.set(key, 0);
  }
  allPaymentsForChart.forEach((p) => {
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyRevenueMap.has(key)) {
      monthlyRevenueMap.set(key, (monthlyRevenueMap.get(key) || 0) + p.amount);
    }
  });
  const revenuePerMonth = Array.from(monthlyRevenueMap.entries())
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }));

  const planDistribution = plansWithClients.map((p) => ({
    name: p.name,
    count: p.clients.length,
  })).sort((a, b) => b.count - a.count);

  return NextResponse.json({
    stats: {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalClients,
      totalMessages,
      unreadMessages,
      totalTestimonials,
      pendingTestimonials,
      totalCoaches,
      totalActivities,
      totalGalleryImages,
      totalPlans,
      totalPayments,
      totalRevenue,
      monthlyRevenue,
      activeClients,
      expiringClients,
      todayAttendances,
      unreadNotifications,
    },
    recentBookings,
    recentMessages,
    recentPayments,
    revenuePerMonth,
    planDistribution,
  });
}
