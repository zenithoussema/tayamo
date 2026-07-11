import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendConfirmationEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }

  const { data, error } = await resend.emails.send({
    from: "Tayamo Sport <noreply@tayamosport.com>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error);
  }

  return data;
}
