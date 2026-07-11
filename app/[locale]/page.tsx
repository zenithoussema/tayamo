import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/locale";

import { getDictionary } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { ActivityCard } from "@/components/ui/ActivityCard";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { Gallery } from "@/components/sections/Gallery";
import { Coaches } from "@/components/sections/Coaches";
import { StatsBar } from "@/components/sections/StatsBar";
import { FadeIn } from "@/components/ui/FadeIn";
import { Target, GraduationCap, Users, Award } from "lucide-react";
export const dynamic = "force-dynamic";

const dayOrder: Record<string, number> = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
};

const dayNames: Record<string, [string, string]> = {
  MONDAY: ["الإثنين", "Lundi"],
  TUESDAY: ["الثلاثاء", "Mardi"],
  WEDNESDAY: ["الأربعاء", "Mercredi"],
  THURSDAY: ["الخميس", "Jeudi"],
  FRIDAY: ["الجمعة", "Vendredi"],
  SATURDAY: ["السبت", "Samedi"],
  SUNDAY: ["الأحد", "Dimanche"],
};

const categoryLabels: Record<string, [string, string]> = {
  KIDS: ["أطفال", "Enfants"],
  ADULTS: ["بالغين", "Adultes"],
  WOMEN: ["نساء", "Femmes"],
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const home = dict.home;
  const isAr = locale === "ar";

  const [activities, dbTestimonials, schedules, cmsSetting, galleryImages, activeCoaches] = await Promise.all([
    prisma.activity.findMany({ orderBy: { id: "asc" } }),
    prisma.testimonial.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" } }),
    prisma.schedule.findMany({ where: { isActive: true }, include: { activity: true } }),
    prisma.setting.findUnique({ where: { key: "homepage_sections" } }),
    prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.coach.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const sectionVisibility: Record<string, boolean> = {};
  if (cmsSetting?.value) {
    try {
      const sections = JSON.parse(cmsSetting.value) as Array<{ id: string; visible: boolean }>;
      for (const s of sections) {
        sectionVisibility[s.id] = s.visible;
      }
    } catch { /* ignore parse errors */ }
  }

  const fallbackTestimonials = [
    {
      id: -1,
      authorName: "Sonia B.",
      content:
        "Mon fils adore le karaté à Tayamo Sport ! Les coachs sont bienveillants et l'ambiance est incroyable. Je recommande à 100%.",
      rating: 5,
      imageUrl: "/images/testimonials/parent-1.jpg",
    },
    {
      id: -2,
      authorName: "Ali M.",
      content:
        "Excellent club familial. Ma fille progresse chaque semaine en gymnastique et elle a gagné en confiance. Merci à toute l'équipe !",
      rating: 5,
      imageUrl: "/images/testimonials/parent-2.jpg",
    },
    {
      id: -3,
      authorName: "Nadia H.",
      content:
        "Le meilleur centre sportif de la région. Les installations sont modernes et les tarifs sont très raisonnables. Ma famille est ravie.",
      rating: 5,
      imageUrl: "/images/testimonials/parent-3.jpg",
    },
    {
      id: -4,
      authorName: "Youssef K.",
      content:
        "J'ai commencé le crossfit il y a 6 mois et les résultats sont bluffants. Les coachs sont passionnés et très professionnels.",
      rating: 5,
      imageUrl: "/images/testimonials/parent-4.jpg",
    },
  ];

  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials;

  const sortedSchedules = schedules.sort(
    (a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek] || a.startTime.localeCompare(b.startTime),
  );

  const groupedSchedules: Record<string, typeof sortedSchedules> = {};
  for (const s of sortedSchedules) {
    if (!groupedSchedules[s.dayOfWeek]) groupedSchedules[s.dayOfWeek] = [];
    groupedSchedules[s.dayOfWeek].push(s);
  }

  const dayKeys = Object.keys(groupedSchedules).sort((a, b) => dayOrder[a] - dayOrder[b]);

  const parsedGalleryImages = galleryImages.map((img) => {
    let altText = img.alt;
    try {
      const parsed = JSON.parse(img.alt);
      altText = parsed.alt || altText;
    } catch {
      // alt is plain text, use as-is
    }
    return { id: img.id, url: img.url, alt: altText };
  });

  const statItems = [home.stat_1, home.stat_2, home.stat_3, home.stat_4];
  const featureItems = [
    { title: home.feature_disc_title, desc: home.feature_disc_desc, icon: <Target className="h-10 w-10" /> },
    { title: home.feature_results_title, desc: home.feature_results_desc, icon: <GraduationCap className="h-10 w-10" /> },
    { title: home.feature_family_title, desc: home.feature_family_desc, icon: <Users className="h-10 w-10" /> },
    { title: home.feature_coaches_title, desc: home.feature_coaches_desc, icon: <Award className="h-10 w-10" /> },
  ];

  const isVisible = (id: string) => {
    if (Object.keys(sectionVisibility).length === 0) return true;
    return sectionVisibility[id] !== false;
  };

  return (
    <>
      {/* ── Hero ── */}
      {isVisible("hero") && (
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        <Image
          src="/images/hero/hero-main.jpg"
          alt="Entraînement sportif Tayamo Sport"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(10,10,10,0.6), rgba(193,18,31,0.75))",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-transparent.png"
            alt="Tayamo Sport"
            width={160}
            height={74}
            className="mb-6 h-auto"
            style={{ maxWidth: 160 }}
          />
          <h1
            className="mb-4 text-4xl font-extrabold leading-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {home.hero_headline}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-200 md:text-xl">
            {home.hero_subtext}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={`/${locale}/reservation`}>
              <Button variant="accent" size="lg">
                {home.hero_cta_trial}
              </Button>
            </Link>
            <Link href={`/${locale}/activities`}>
              <Button variant="outline" size="lg">
                {home.hero_cta_discover}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* ── Trust Strip ── */}
      <StatsBar stats={statItems} />

      {/* ── Activities Grid ── */}
      {isVisible("activities") && (
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <FadeIn>
            <h2
              className="mb-4 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {home.activities_title}
            </h2>
            <p className="mb-10 text-center text-gray-600">{home.activities_subtitle}</p>
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a, i) => (
              <FadeIn key={a.id} delay={i * 100}>
                <ActivityCard
                  locale={locale as Locale}
                  name={isAr ? a.nameAr : a.nameFr}
                  slug={a.slug}
                  description={isAr ? a.descriptionAr : a.descriptionFr}
                  ageRangeMin={a.ageRangeMin}
                  ageRangeMax={a.ageRangeMax}
                  iconName={a.iconName}
                  imgSrc={a.coverImageUrl}
                  dictionary={dict.activities}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Why Tayamo Features ── */}
      {isVisible("about") && (
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <FadeIn>
            <h2
              className="mb-12 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {home.features_title}
            </h2>
          </FadeIn>
          <div className="grid gap-8 md:grid-cols-4">
            {featureItems.map((f, i) => (
              <FadeIn key={i} delay={i * 100}>
                <Card className="p-6 text-center">
                  <div className="mb-4 text-accent">{f.icon}</div>
                  <h3 className="mb-2 text-lg font-bold text-primary-dark">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Testimonials ── */}
      {isVisible("testimonials") && (
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <FadeIn>
            <h2
              className="mb-12 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {home.testimonials_title}
            </h2>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.id} delay={i * 150}>
                <TestimonialCard
                  authorName={t.authorName}
                  content={t.content}
                  rating={t.rating}
                  imageUrl={"imageUrl" in t ? t.imageUrl : undefined}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Gallery ── */}
      {isVisible("gallery") &&       <Gallery images={parsedGalleryImages} />}

      {/* ── Coaches ── */}
      {isVisible("trainers") && <Coaches coaches={activeCoaches} />}

      {/* ── Weekly Schedule ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2
            className="mb-4 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {home.schedule_title}
          </h2>
          <p className="mb-10 text-center text-gray-600">{home.schedule_subtitle}</p>
          <div className="overflow-x-auto rounded-2xl bg-bg shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-dark text-white">
                  <th className="px-4 py-3 text-left font-semibold">
                    {isAr ? "اليوم" : "Jour"}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    {isAr ? "النشاط" : "Activité"}
                  </th>
                  <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                    {isAr ? "الفئة" : "Catégorie"}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    {isAr ? "التوقيت" : "Horaire"}
                  </th>
                  <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                    {isAr ? "المدرب" : "Coach"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dayKeys.map((day) =>
                  groupedSchedules[day].map((s, i) => (
                    <tr key={s.id} className={i === 0 ? "border-t-2 border-primary" : ""}>
                      {i === 0 && (
                        <td
                          rowSpan={groupedSchedules[day].length}
                          className="px-4 py-3 font-semibold text-primary-dark align-top"
                        >
                          {dayNames[day][isAr ? 0 : 1]}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        {isAr ? s.activity.nameAr : s.activity.nameFr}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-dark">
                          {categoryLabels[s.category as keyof typeof categoryLabels]?.[isAr ? 0 : 1] || s.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.startTime} - {s.endTime}
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                        {s.coachName}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Final CTA Banner ── */}
      {isVisible("cta") && (
      <section className="bg-gradient-to-r from-primary-dark via-primary to-red-800 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2
            className="mb-4 text-3xl font-extrabold md:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {home.cta_banner_title}
          </h2>
          <p className="mb-8 text-lg text-gray-200">{home.cta_banner_sub}</p>
          <Link href={`/${locale}/reservation`}>
            <Button variant="accent" size="lg">
              {home.cta_banner_btn}
            </Button>
          </Link>
        </div>
      </section>
      )}
    </>
  );
}
