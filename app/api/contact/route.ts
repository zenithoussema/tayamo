import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { validatePhone, validateRequired } from "@/lib/validation";

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
  const { allowed } = checkRateLimit(`contact:${ip}`, 5, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 1 minute." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, message, activityInterest } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const nameCheck = validateRequired(name, "Nom");
    if (!nameCheck.valid) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) return NextResponse.json({ error: phoneCheck.error }, { status: 400 });

    const msgCheck = validateRequired(message, "Message");
    if (!msgCheck.valid) return NextResponse.json({ error: msgCheck.error }, { status: 400 });

    if (message.length > 2000) {
      return NextResponse.json({ error: "Message trop long (max 2000 caractères)" }, { status: 400 });
    }

    const contactMessage = await prisma.contactMessage.create({
      data: { name, phone, email: email || null, message, activityInterest: activityInterest || null },
    });

    await sendConfirmationEmail({
      to: process.env.ADMIN_EMAIL || "admin@tayamosport.com",
      subject: "Nouveau message de contact — Tayamo Sport",
      html: `<h2>Message de ${escapeHtml(name)}</h2>
<p><strong>Nom :</strong> ${escapeHtml(name)}</p>
<p><strong>Téléphone :</strong> ${escapeHtml(phone)}</p>
${email ? `<p><strong>Email :</strong> ${escapeHtml(email)}</p>` : ""}
${activityInterest ? `<p><strong>Activité :</strong> ${escapeHtml(activityInterest)}</p>` : ""}
<p><strong>Message :</strong></p><p>${escapeHtml(message)}</p>`,
    });

    return NextResponse.json({ success: true, contactMessage }, { status: 201 });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 },
    );
  }
}
