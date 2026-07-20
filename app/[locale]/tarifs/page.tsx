import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { FadeIn } from "@/components/ui/FadeIn";
import { Check } from "lucide-react";

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
    <section className="min-h-screen pt-28 pb-20 lg:pt-32 lg:pb-28">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <FadeIn>
          <div className="mb-14 text-center">
            <h1
              className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Tarifs et <span className="gold-text">Abonnements</span>
            </h1>
            <p className="mx-auto max-w-lg text-text-muted">{t.subtitle}</p>
            <div className="section-divider mx-auto mt-6 w-24" />
          </div>
        </FadeIn>

        {plans.length === 0 ? (
          <FadeIn>
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
              <p className="text-lg text-text-muted">
                {isAr ? "لا توجد عروض متاحة حالياً" : "Aucun abonnement disponible pour le moment"}
              </p>
            </div>
          </FadeIn>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => {
              const isMiddle = plans.length >= 3 && index === 1;

              return (
                <FadeIn key={plan.id} delay={index * 100}>
                  <div
                    className={`relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-500 ${
                      isMiddle
                        ? "border-accent/30 bg-surface shadow-[0_0_60px_rgba(212,175,55,0.08)]"
                        : "border-border bg-surface hover:border-white/[0.08]"
                    }`}
                  >
                    {isMiddle && (
                      <Badge variant="warning" className="absolute -top-3 left-1/2 -translate-x-1/2">
                        {isAr ? "الأكثر طلباً" : "Le plus demandé"}
                      </Badge>
                    )}
                    <h3
                      className="mb-2 text-xl font-bold text-text"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {plan.name}
                    </h3>
                    <p className="mb-1 text-4xl font-bold text-accent">
                      {plan.price} <span className="text-sm font-normal text-text-dim">TND</span>
                    </p>
                    <p className="mb-6 text-sm text-text-dim">
                      {formatDuration(plan.durationDays)}
                    </p>
                    {plan.features.length > 0 && (
                      <ul className="mb-8 flex flex-1 flex-col gap-3 text-sm text-text-secondary">
                        {plan.features.map((perk, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto">
                      <Link
                        href={`/${locale}/reservation?plan=${plan.id}`}
                        className={`block w-full rounded-xl py-3.5 text-center text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                          isMiddle
                            ? "bg-accent text-text-on-accent hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                            : "border border-border-strong text-text hover:border-accent/30 hover:bg-accent-faint hover:text-accent"
                        }`}
                      >
                        {t.cta}
                      </Link>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* Payment note */}
        <FadeIn>
          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-accent/10 bg-accent-faint p-4 text-center text-sm text-accent-muted">
            {t.payment_note}
          </div>
        </FadeIn>

        {/* FAQ Accordion */}
        <div className="mx-auto mt-20 max-w-3xl">
          <FadeIn>
            <h2
              className="mb-8 text-center text-2xl font-bold tracking-tight text-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.faq_title}
            </h2>
          </FadeIn>
          <Accordion items={faqItems} />
        </div>
      </div>
    </section>
  );
}
