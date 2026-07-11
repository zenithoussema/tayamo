import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const [
      clients, payments, attendance, bookings, coaches,
      schedules, activities, testimonials, messages, gallery,
      settings, plans, notifications, auditLogs, feedbacks, users,
    ] = await Promise.all([
      prisma.client.findMany({ orderBy: { id: "asc" } }),
      prisma.payment.findMany({ orderBy: { id: "asc" } }),
      prisma.attendance.findMany({ orderBy: { id: "asc" } }),
      prisma.booking.findMany({ orderBy: { id: "asc" } }),
      prisma.coach.findMany({ orderBy: { id: "asc" } }),
      prisma.schedule.findMany({ orderBy: { id: "asc" } }),
      prisma.activity.findMany({ orderBy: { id: "asc" } }),
      prisma.testimonial.findMany({ orderBy: { id: "asc" } }),
      prisma.contactMessage.findMany({ orderBy: { id: "asc" } }),
      prisma.galleryImage.findMany({ orderBy: { id: "asc" } }),
      prisma.setting.findMany({ orderBy: { id: "asc" } }),
      prisma.subscriptionPlan.findMany({ orderBy: { id: "asc" } }),
      prisma.notification.findMany({ orderBy: { id: "asc" } }),
      prisma.auditLog.findMany({ orderBy: { id: "asc" } }),
      prisma.feedback.findMany({ orderBy: { id: "asc" } }),
      prisma.user.findMany({ orderBy: { id: "asc" }, select: { id: true, username: true, email: true, fullName: true, role: true, isActive: true, createdAt: true } }),
    ]);

    const backup = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      data: {
        clients, payments, attendance, bookings, coaches,
        schedules, activities, testimonials, messages, gallery,
        settings, plans, notifications, auditLogs, feedbacks, users,
      },
    };

    logAudit({ action: "Database backup created", entity: "System", details: "Full database backup" });

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="tayamo-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 });
  }
}
