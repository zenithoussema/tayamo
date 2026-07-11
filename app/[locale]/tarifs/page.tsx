import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";

export const dynamic = "force-dynamic";

function formatDuration(days: number): string {
  if (days < 30) return `${days} jour${days > 1 ? "s" : ""}`;
  const months = Math.round(days / 30);
  return `${months} mois`;
}

export default async function TarifsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.tarifs;
  const isAr = locale === "ar";

  const dbPlans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  const plans = dbPlans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    durationDays: p.durationDays,
    features: (() => {
      try { return JSON.parse(p.features) as string[]; }
      catch { return []; }
    })(),
  }));

  const faqItems = [
    { title: t.faq_q1, content: t.faq_a1 },
    { title: t.faq_q2, content: t.faq_a2 },
    { title: t.faq_q3, content: t.faq_a3 },
    { title: t.faq_q4, content: t.faq_a4 },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h1
          className="mb-4 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t.title}
        </h1>
        <p className="mb-10 text-center text-gray-600">{t.subtitle}</p>

        {plans.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-gray-500">
              {isAr ? "لا توجد عروض متاحة حالياً" : "Aucun abonnement disponible pour le moment"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => {
              const isMiddle = plans.length >= 3 && index === 1;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col p-6 ${isMiddle ? "ring-2 ring-primary" : ""}`}
                >
                  {isMiddle && (
                    <Badge variant="danger" className="absolute -top-3 left-1/2 -translate-x-1/2">
                      {isAr ? "الأكثر طلباً" : "Le plus demandé"}
                    </Badge>
                  )}
                  <h3
                    className="mb-1 text-xl font-bold text-primary-dark"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="mb-1 text-3xl font-bold text-primary">
                    {plan.price} <span className="text-sm font-normal text-gray-500">TND</span>
                  </p>
                  <p className="mb-4 text-sm text-gray-500">
                    {formatDuration(plan.durationDays)}
                  </p>
                  {plan.features.length > 0 && (
                    <ul className="mb-6 flex flex-col gap-2 text-sm text-gray-600">
                      {plan.features.map((perk, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {perk}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto">
                    <Link
                      href={`/${locale}/reservation?plan=${plan.id}`}
                      className="block w-full rounded-lg bg-primary px-6 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-red-700"
                    >
                      {t.cta}
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Payment note */}
        <div className="mx-auto mt-8 max-w-2xl rounded-xl bg-yellow-50 p-4 text-center text-sm text-yellow-800">
          {t.payment_note}
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2
            className="mb-6 text-center text-2xl font-extrabold text-primary-dark"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.faq_title}
          </h2>
          <Accordion items={faqItems} />
        </div>
      </div>
    </section>
  );
}
