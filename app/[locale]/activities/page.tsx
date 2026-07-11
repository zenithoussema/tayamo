import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
export const dynamic = "force-dynamic";

const dayNames: Record<string, [string, string]> = {
  MONDAY: ["الإثنين", "Lundi"],
  TUESDAY: ["الثلاثاء", "Mardi"],
  WEDNESDAY: ["الأربعاء", "Mercredi"],
  THURSDAY: ["الخميس", "Jeudi"],
  FRIDAY: ["الجمعة", "Vendredi"],
  SATURDAY: ["السبت", "Samedi"],
  SUNDAY: ["الأحد", "Dimanche"],
};

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const acts = dict.activities;
  const isAr = locale === "ar";

  const activities = await prisma.activity.findMany({
    orderBy: { id: "asc" },
    include: {
      schedules: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h1
          className="mb-4 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {acts.title}
        </h1>
        <p className="mb-8 text-center text-gray-600">{acts.subtitle}</p>

        {/* Anchor-jump menu */}
        <div className="mb-12 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-500">{acts.jump_to}</p>
          <div className="flex flex-wrap gap-2">
            {activities.map((a) => (
              <a
                key={a.id}
                href={`#activity-${a.slug}`}
                className="rounded-full bg-bg px-4 py-2 text-sm font-medium text-primary-dark transition-colors hover:bg-primary hover:text-white"
              >
                {isAr ? a.nameAr : a.nameFr}
              </a>
            ))}
          </div>
        </div>

        {/* Activity sections */}
        <div className="flex flex-col gap-10">
          {activities.map((a) => (
            <article
              key={a.id}
              id={`activity-${a.slug}`}
              className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm md:p-8"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h2
                      className="text-2xl font-bold text-primary-dark"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {isAr ? a.nameAr : a.nameFr}
                    </h2>
                    <Badge variant="warning">
                      {acts.age_range
                        .replace("%min%", String(a.ageRangeMin))
                        .replace("%max%", String(a.ageRangeMax))}
                    </Badge>
                  </div>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    {isAr ? a.descriptionAr : a.descriptionFr}
                  </p>
                  <Link href={`/${locale}/reservation`}>
                    <Button variant="accent" size="sm">
                      {acts.trial}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Schedule table for this activity */}
              {a.schedules.length > 0 ? (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    {acts.schedule}
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                            {acts.day}
                          </th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                            {acts.time}
                          </th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                            {acts.coach}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {a.schedules.map((s) => (
                          <tr key={s.id}>
                            <td className="px-4 py-2.5 font-medium text-primary-dark">
                              {dayNames[s.dayOfWeek][isAr ? 0 : 1]}
                            </td>
                            <td className="px-4 py-2.5 text-gray-700">
                              {s.startTime} - {s.endTime}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500">{s.coachName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm italic text-gray-400">{acts.no_schedule}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
