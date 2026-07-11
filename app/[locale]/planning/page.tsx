import type { Metadata } from "next";
import { prisma } from "@/lib/db";
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
  KIDS: "bg-blue-50 text-blue-700 border-blue-200",
  ADULTS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WOMEN: "bg-pink-50 text-pink-700 border-pink-200",
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
    <section className="bg-bg py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1
            className="mb-4 text-3xl font-extrabold text-primary-dark md:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isAr ? "برنامج الصيف" : "Planning Été"}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {isAr
              ? "تعرف على مواعيد جميع الأنشطة الرياضية — كل ما تحتاجونه في مكان واحد"
              : "Découvrez les horaires de toutes nos activités sportives — tout ce dont vous avez besoin en un seul endroit"}
          </p>
        </div>

        {/* Gym Hours Banner */}
        <div className="mb-10 rounded-2xl bg-primary-dark p-6 text-center text-white shadow-lg">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg font-bold">
              {isAr ? "أوقات فتح الصالة" : "Horaires d'ouverture"}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-lg font-semibold text-accent">
              {isAr ? "كل يوم 08:00 — 22:00" : "Tous les jours 08:00 — 22:00"}
            </span>
          </div>
        </div>

        {/* Activities Schedule */}
        {activityNames.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <svg className="mx-auto mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg text-gray-500">
              {isAr ? "لا توجد مواعيد متاحة حالياً" : "Aucun horaire disponible pour le moment"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {activityNames.map((actName) => {
              const categories = groupedByActivity[actName];
              const categoryKeys = Object.keys(categories).sort();

              return (
                <div key={actName} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  {/* Activity Header */}
                  <div className="bg-primary-dark px-6 py-4">
                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                      {actName}
                    </h2>
                  </div>

                  {/* Categories */}
                  <div className="divide-y divide-gray-100">
                    {categoryKeys.map((cat) => {
                      const items = categories[cat];
                      return (
                        <div key={cat} className="px-6 py-5">
                          <div className="mb-4 flex items-center gap-3">
                            <h3
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${categoryBadgeColors[cat] || "bg-gray-50 text-gray-700 border-gray-200"}`}
                            >
                              {catName(cat)}
                            </h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-100">
                                  <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    {isAr ? "اليوم" : "Jour"}
                                  </th>
                                  <th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    {isAr ? "التوقيت" : "Horaire"}
                                  </th>
                                  <th className="hidden pb-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 md:table-cell">
                                    {isAr ? "المدرب" : "Coach"}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {items.map((s) => (
                                  <tr key={s.id} className="transition-colors hover:bg-gray-50/50">
                                    <td className="py-3 pr-4 font-semibold text-primary-dark">
                                      {dayName(s.dayOfWeek)}
                                    </td>
                                    <td className="py-3 pr-4 font-mono text-gray-700">
                                      {s.startTime.slice(0, 5)} — {s.endTime.slice(0, 5)}
                                    </td>
                                    <td className="hidden py-3 text-gray-500 md:table-cell">
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
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary-dark via-primary to-red-800 p-8 text-center text-white shadow-lg">
          <h3
            className="mb-3 text-2xl font-extrabold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isAr ? "سجل الآن واحصل على جلسة مجانية" : "Inscrivez-vous et obtenez un cours gratuit"}
          </h3>
          <p className="mb-6 text-gray-200">
            {isAr
              ? "-contactونا للحصول على更多信息"
              : "Contactez-nous pour plus d'informations ou réservez votre séance d'essai gratuite"}
          </p>
          <a
            href={`/${locale}/reservation`}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3 text-sm font-bold text-primary-dark transition-colors hover:bg-yellow-500"
          >
            {isAr ? "احجز جلسة مجانية" : "Réserver une séance gratuite"}
          </a>
        </div>
      </div>
    </section>
  );
}
