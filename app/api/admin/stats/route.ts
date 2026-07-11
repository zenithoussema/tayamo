import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

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
  ]);

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
  });
}
