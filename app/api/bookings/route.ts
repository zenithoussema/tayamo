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
  const { allowed } = checkRateLimit(`bookings:${ip}`, 5, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 1 minute." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { activityId, scheduleId, parentName, parentPhone, childName, childBirthDate, isTrialSession } = body;

    if (!parentName || !parentPhone || !childName || !activityId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const nameCheck = validateRequired(parentName, "Nom du parent");
    if (!nameCheck.valid) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

    const childCheck = validateRequired(childName, "Nom de l'enfant");
    if (!childCheck.valid) return NextResponse.json({ error: childCheck.error }, { status: 400 });

    const phoneCheck = validatePhone(parentPhone);
    if (!phoneCheck.valid) return NextResponse.json({ error: phoneCheck.error }, { status: 400 });

    const parsedActivityId = parseInt(activityId);
    if (isNaN(parsedActivityId) || parsedActivityId <= 0) {
      return NextResponse.json({ error: "Activité invalide" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        activityId: parsedActivityId,
        scheduleId: scheduleId ? parseInt(scheduleId) : null,
        parentName,
        parentPhone,
        childName,
        childBirthDate: childBirthDate ? new Date(childBirthDate) : null,
        isTrialSession: isTrialSession !== false,
        status: "PENDING",
      },
    });

    const activity = await prisma.activity.findUnique({ where: { id: parsedActivityId } });

    await sendConfirmationEmail({
      to: process.env.ADMIN_EMAIL || "admin@tayamosport.com",
      subject: "Nouvelle demande de réservation — Tayamo Sport",
      html: `<h2>Nouvelle réservation</h2>
<p><strong>Parent :</strong> ${escapeHtml(parentName)}</p>
<p><strong>Téléphone :</strong> ${escapeHtml(parentPhone)}</p>
<p><strong>Enfant :</strong> ${escapeHtml(childName)}</p>
${childBirthDate ? `<p><strong>Date de naissance :</strong> ${escapeHtml(childBirthDate)}</p>` : ""}
<p><strong>Activité :</strong> ${escapeHtml(activity?.nameFr ?? activityId)}</p>
<p><strong>Séance d'essai :</strong> ${isTrialSession !== false ? "Oui" : "Non"}</p>`,
    });

    revalidatePath("/admin");

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 },
    );
  }
}
