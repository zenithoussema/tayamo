import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import { getContactSettings } from "@/lib/contact-settings";
import { ReservationForm } from "./ReservationForm";
import { FadeIn } from "@/components/ui/FadeIn";
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
    <section className="min-h-screen pt-28 pb-20 lg:pt-32 lg:pb-28">
      <div className="mx-auto max-w-2xl px-5 lg:px-8">
        <FadeIn>
          <div className="mb-10 text-center">
            <h1
              className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="gold-text">{dict.reservation.title}</span>
            </h1>
            <p className="mx-auto max-w-lg text-text-muted">{dict.reservation.subtitle}</p>
            <div className="section-divider mx-auto mt-6 w-24" />
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <ReservationForm
            dict={dict.reservation}
            locale={locale as Locale}
            isAr={locale === "ar"}
            activities={activities}
            schedules={schedules}
            preselectedPlanName={planRecord?.name || null}
            whatsappUrl={whatsappUrl}
          />
        </FadeIn>
      </div>
    </section>
  );
}
