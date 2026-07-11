import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { validatePhone, validateRequired } from "@/lib/validation";
import { revalidatePath } from "next/cache";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`reservation:${ip}`, 5, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 1 minute." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { name, phone, email, activity, date } = body;

    if (!name || !phone || !activity || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const nameCheck = validateRequired(name, "Nom");
    if (!nameCheck.valid) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) return NextResponse.json({ error: phoneCheck.error }, { status: 400 });

    const booking = await prisma.booking.create({
      data: {
        parentName: name,
        parentPhone: phone,
        childName: name,
        activityId: 1,
        isTrialSession: true,
      },
    });

    if (email) {
      await sendConfirmationEmail({
        to: email,
        subject: "Demande de réservation reçue — Tayamo Sport",
        html: `<p>Bonjour ${escapeHtml(name)},</p><p>Nous avons bien reçu votre demande de réservation pour ${escapeHtml(activity)} le ${escapeHtml(date)}. Nous vous contacterons sous peu.</p><p>Cordialement,<br/>L'équipe Tayamo Sport</p>`,
      });
    }

    revalidatePath("/admin");

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("Reservation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
