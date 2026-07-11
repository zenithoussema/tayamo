import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!body.version || !body.data || !body.confirm) {
      return NextResponse.json({ error: "Structure de sauvegarde invalide. Confirmation requise." }, { status: 400 });
    }

    if (body.confirm !== "RESTORE_CONFIRMED") {
      return NextResponse.json({ error: "Confirmation invalide" }, { status: 400 });
    }

    const { data } = body;
    const counts: Record<string, number> = {};

    await prisma.$transaction(async (tx) => {
      await tx.feedback.deleteMany();
      await tx.auditLog.deleteMany();
      await tx.notification.deleteMany();
      await tx.attendance.deleteMany();
      await tx.payment.deleteMany();
      await tx.booking.deleteMany();
      await tx.schedule.deleteMany();
      await tx.client.deleteMany();
      await tx.coach.deleteMany();
      await tx.activity.deleteMany();
      await tx.testimonial.deleteMany();
      await tx.contactMessage.deleteMany();
      await tx.galleryImage.deleteMany();
      await tx.setting.deleteMany();
      await tx.subscriptionPlan.deleteMany();
      await tx.user.deleteMany();

      if (data.users?.length) {
        await tx.user.createMany({ data: data.users });
        counts.users = data.users.length;
      }
      if (data.plans?.length) {
        await tx.subscriptionPlan.createMany({ data: data.plans });
        counts.plans = data.plans.length;
      }
      if (data.settings?.length) {
        await tx.setting.createMany({ data: data.settings });
        counts.settings = data.settings.length;
      }
      if (data.activities?.length) {
        await tx.activity.createMany({ data: data.activities });
        counts.activities = data.activities.length;
      }
      if (data.coaches?.length) {
        await tx.coach.createMany({ data: data.coaches });
        counts.coaches = data.coaches.length;
      }
      if (data.clients?.length) {
        await tx.client.createMany({ data: data.clients });
        counts.clients = data.clients.length;
      }
      if (data.bookings?.length) {
        await tx.booking.createMany({ data: data.bookings });
        counts.bookings = data.bookings.length;
      }
      if (data.payments?.length) {
        await tx.payment.createMany({ data: data.payments });
        counts.payments = data.payments.length;
      }
      if (data.attendance?.length) {
        await tx.attendance.createMany({ data: data.attendance });
        counts.attendance = data.attendance.length;
      }
      if (data.schedules?.length) {
        await tx.schedule.createMany({ data: data.schedules });
        counts.schedules = data.schedules.length;
      }
      if (data.testimonials?.length) {
        await tx.testimonial.createMany({ data: data.testimonials });
        counts.testimonials = data.testimonials.length;
      }
      if (data.messages?.length) {
        await tx.contactMessage.createMany({ data: data.messages });
        counts.messages = data.messages.length;
      }
      if (data.gallery?.length) {
        await tx.galleryImage.createMany({ data: data.gallery });
        counts.gallery = data.gallery.length;
      }
      if (data.notifications?.length) {
        await tx.notification.createMany({ data: data.notifications });
        counts.notifications = data.notifications.length;
      }
      if (data.auditLogs?.length) {
        await tx.auditLog.createMany({ data: data.auditLogs });
        counts.auditLogs = data.auditLogs.length;
      }
      if (data.feedbacks?.length) {
        await tx.feedback.createMany({ data: data.feedbacks });
        counts.feedbacks = data.feedbacks.length;
      }
    });

    logAudit({ action: "Database restored from backup", entity: "System", details: `Restored ${JSON.stringify(counts)}` });

    return NextResponse.json({ success: true, counts });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: "Erreur lors de la restauration" }, { status: 500 });
  }
}
