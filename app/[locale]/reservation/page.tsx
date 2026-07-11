import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import { getContactSettings } from "@/lib/contact-settings";
import { ReservationForm } from "./ReservationForm";
export const dynamic = "force-dynamic";

export default async function ReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { locale } = await params;
  const { plan } = await searchParams;
  const dict = await getDictionary(locale as Locale);

  const [activities, schedules, planRecord, contact] = await Promise.all([
    prisma.activity.findMany({ orderBy: { id: "asc" } }),
    prisma.schedule.findMany({ where: { isActive: true }, include: { activity: true }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] }),
    plan ? prisma.subscriptionPlan.findUnique({ where: { id: parseInt(plan) } }) : null,
    getContactSettings(),
  ]);

  const whatsappNumber = contact.whatsapp.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-2xl px-4">
        <h1
          className="mb-4 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {dict.reservation.title}
        </h1>
        <p className="mb-10 text-center text-gray-600">{dict.reservation.subtitle}</p>
        <ReservationForm
          dict={dict.reservation}
          locale={locale as Locale}
          isAr={locale === "ar"}
          activities={activities}
          schedules={schedules}
          preselectedPlanName={planRecord?.name || null}
          whatsappUrl={whatsappUrl}
        />
      </div>
    </section>
  );
}
