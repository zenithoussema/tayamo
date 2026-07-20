import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { FadeIn } from "@/components/ui/FadeIn";
import { Clock, ArrowRight } from "lucide-react";
export const dynamic = "force-dynamic";

const dayNamesAr: Record<string, string> = {
  MONDAY: "الإثنين", TUESDAY: "الثلاثاء", WEDNESDAY: "الأربعاء",
  THURSDAY: "الخميس", FRIDAY: "الجمعة", SATURDAY: "السبت", SUNDAY: "الأحد",
};

const dayNamesFr: Record<string, string> = {
  MONDAY: "Lundi", TUESDAY: "Mardi", WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi", FRIDAY: "Vendredi", SATURDAY: "Samedi", SUNDAY: "Dimanche",
};

const categoryNamesAr: Record<string, string> = {
  KIDS: "أطفال", ADULTS: "بالغين", WOMEN: "نساء",
};

const categoryNamesFr: Record<string, string> = {
  KIDS: "Enfants", ADULTS: "Adultes", WOMEN: "Femmes",
};

const categoryBadgeColors: Record<string, string> = {
  KIDS: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  ADULTS: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  WOMEN: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
};

export const metadata: Metadata = {
  title: "Planning | Tayamo Sport",
  description: "Consultez le planning des cours de sport chez Tayamo Sport",
};

export default async function PlanningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const schedules = await prisma.schedule.findMany({
    where: { isActive: true },
    include: { activity: { select: { nameFr: true, nameAr: true, slug: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  type ScheduleItem = (typeof schedules)[number];

  const groupedByActivity: Record<string, Record<string, ScheduleItem[]>> = {};
  for (const s of schedules) {
    const actName = isAr ? s.activity.nameAr : s.activity.nameFr;
    if (!groupedByActivity[actName]) groupedByActivity[actName] = {};
    if (!groupedByActivity[actName][s.category]) groupedByActivity[actName][s.category] = [];
    groupedByActivity[actName][s.category].push(s);
  }

  const activityNames = Object.keys(groupedByActivity);

  const dayName = (day: string) => isAr ? dayNamesAr[day] : dayNamesFr[day];
  const catName = (cat: string) => isAr ? categoryNamesAr[cat] : categoryNamesFr[cat];

  return (
    <section className="min-h-screen pt-28 pb-20 lg:pt-32 lg:pb-28">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        {/* Header */}
        <FadeIn>
          <div className="mb-14 text-center">
            <h1
              className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {isAr ? "برنامج الصيف" : "Planning"} <span className="gold-text">{isAr ? "" : "Été"}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-text-muted">
              {isAr
                ? "تعرف على مواعيد جميع الأنشطة الرياضية — كل ما تحتاجونه في مكان واحد"
                : "Découvrez les horaires de toutes nos activités sportives — tout ce dont vous avez besoin en un seul endroit"}
            </p>
            <div className="section-divider mx-auto mt-6 w-24" />
          </div>
        </FadeIn>

        {/* Gym Hours Banner */}
        <FadeIn delay={100}>
          <div className="mb-12 rounded-2xl border border-accent/20 bg-accent-faint p-6 text-center">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-lg font-bold text-text">
                {isAr ? "أوقات فتح الصالة" : "Horaires d'ouverture"}
              </span>
              <span className="text-text-dim">|</span>
              <span className="text-lg font-semibold text-accent">
                {isAr ? "كل يوم 08:00 — 22:00" : "Tous les jours 08:00 — 22:00"}
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Activities Schedule */}
        {activityNames.length === 0 ? (
          <FadeIn>
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
              <Clock className="mx-auto mb-4 h-12 w-12 text-text-dim" />
              <p className="text-lg text-text-muted">
                {isAr ? "لا توجد مواعيد متاحة حالياً" : "Aucun horaire disponible pour le moment"}
              </p>
            </div>
          </FadeIn>
        ) : (
          <div className="flex flex-col gap-6">
            {activityNames.map((actName, i) => {
              const categories = groupedByActivity[actName];
              const categoryKeys = Object.keys(categories).sort();

              return (
                <FadeIn key={actName} delay={i * 80}>
                  <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                    {/* Activity Header */}
                    <div className="border-b border-accent/10 bg-accent-faint px-6 py-4">
                      <h2 className="text-xl font-bold text-text" style={{ fontFamily: "var(--font-heading)" }}>
                        {actName}
                      </h2>
                    </div>

                    {/* Categories */}
                    <div className="divide-y divide-border">
                      {categoryKeys.map((cat) => {
                        const items = categories[cat];
                        return (
                          <div key={cat} className="px-6 py-5">
                            <div className="mb-4 flex items-center gap-3">
                              <h3
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${categoryBadgeColors[cat] || "bg-white/5 text-text-secondary border border-border-strong"}`}
                              >
                                {catName(cat)}
                              </h3>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="premium-table w-full text-sm">
                                <thead>
                                  <tr>
                                    <th>{isAr ? "اليوم" : "Jour"}</th>
                                    <th>{isAr ? "التوقيت" : "Horaire"}</th>
                                    <th className="hidden md:table-cell">{isAr ? "المدرب" : "Coach"}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((s) => (
                                    <tr key={s.id}>
                                      <td className="font-semibold text-text">
                                        {dayName(s.dayOfWeek)}
                                      </td>
                                      <td className="font-mono">
                                        {s.startTime.slice(0, 5)} — {s.endTime.slice(0, 5)}
                                      </td>
                                      <td className="hidden text-text-muted md:table-cell">
                                        {s.coachName}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <FadeIn>
          <div className="relative mt-14 overflow-hidden rounded-2xl border border-accent/20 p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-[#1a1500] to-bg" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06)_0%,transparent_60%)]" />
            <div className="relative">
              <h3
                className="mb-3 text-2xl font-bold text-text"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {isAr ? "سجل الآن واحصل على جلسة مجانية" : "Inscrivez-vous et obtenez un cours gratuit"}
              </h3>
              <p className="mb-6 text-text-muted">
                {isAr
                  ? "-contactونا للحصول على更多信息"
                  : "Contactez-nous pour plus d'informations ou réservez votre séance d'essai gratuite"}
              </p>
              <a
                href={`/${locale}/reservation`}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-text-on-accent transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
              >
                {isAr ? "احجز جلسة مجانية" : "Réserver une séance gratuite"}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
