import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/locale";

import { getDictionary } from "@/lib/dictionaries";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/Button";

import { ActivityCard } from "@/components/ui/ActivityCard";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { Coaches } from "@/components/sections/Coaches";
import { StatsBar } from "@/components/sections/StatsBar";
import { FadeIn } from "@/components/ui/FadeIn";
import { Target, GraduationCap, Users, Award, ChevronDown, Calendar } from "lucide-react";
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

  const [activities, dbTestimonials, schedules, cmsSetting, galleryImages, activeCoaches, latestNews, latestProducts, promoSetting] = await Promise.all([
    prisma.activity.findMany({ orderBy: { id: "asc" } }),
    prisma.testimonial.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" } }),
    prisma.schedule.findMany({ where: { isActive: true }, include: { activity: true } }),
    prisma.setting.findUnique({ where: { key: "homepage_sections" } }),
    prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.coach.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
    prisma.news.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.shopProduct.findMany({
      where: { isActive: true },
      orderBy: [{ isNew: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
    prisma.setting.findUnique({ where: { key: "promo_banner" } }),
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
    } catch {}
    return { id: img.id, url: img.url, alt: altText };
  });

  let promoBanner: { enabled: boolean; title: string; subtitle: string; link: string; bg: string } | null = null;
  if (promoSetting?.value) {
    try { promoBanner = JSON.parse(promoSetting.value); } catch {}
  }

  const statItems = [home.stat_1, home.stat_2, home.stat_3, home.stat_4];
  const featureItems = [
    { title: home.feature_disc_title, desc: home.feature_disc_desc, icon: <Target className="h-8 w-8" /> },
    { title: home.feature_results_title, desc: home.feature_results_desc, icon: <GraduationCap className="h-8 w-8" /> },
    { title: home.feature_family_title, desc: home.feature_family_desc, icon: <Users className="h-8 w-8" /> },
    { title: home.feature_coaches_title, desc: home.feature_coaches_desc, icon: <Award className="h-8 w-8" /> },
  ];

  const isVisible = (id: string) => {
    if (Object.keys(sectionVisibility).length === 0) return true;
    return sectionVisibility[id] !== false;
  };

  return (
    <>
      {/* ── Hero ── */}
      {isVisible("hero") && (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <Image
          src="/images/hero/hero-main.jpg"
          alt="Entraînement sportif Tayamo Sport"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[var(--c-hero-gradient)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.08)_0%,transparent_60%)]" />

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-[var(--c-accent-faint)] blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-[var(--c-accent-faint)] blur-[120px] animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 mx-auto max-w-5xl px-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-transparent.png"
            alt="Tayamo Sport"
            width={160}
            height={74}
            className="mx-auto mb-8 h-auto animate-fade-in-down"
            style={{ maxWidth: 160, animationDelay: "0.2s" }}
          />
          <h1
            className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-text md:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-heading)", animationDelay: "0.4s" }}
          >
            <span className="animate-fade-in-up">{home.hero_headline}</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-text-secondary md:text-xl animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            {home.hero_subtext}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <Link href={`/${locale}/reservation`}>
              <Button variant="accent" size="lg">
                {home.hero_cta_trial}
              </Button>
            </Link>
            <Link href={`/${locale}/planning`}>
              <Button variant="outline" size="lg">
                {home.hero_cta_discover}
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in-up" style={{ animationDelay: "1.2s" }}>
            <ChevronDown className="h-6 w-6 text-text-dim animate-bounce" />
          </div>
        </div>
      </section>
      )}

      {/* ── Trust Strip ── */}
      <StatsBar stats={statItems} />

      {/* ── Promo Banner ── */}
      {promoBanner?.enabled && (
      <section className="border-y border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6">
          <FadeIn>
            <Link
              href={promoBanner.link || `/${locale}/shop`}
              className="group block rounded-2xl border border-border-accent bg-gradient-to-r from-[var(--c-accent-dim)] via-[var(--c-accent-faint)] to-[var(--c-accent-dim)] p-6 text-center transition-all duration-500 hover:border-border-accent hover:shadow-[0_10px_40px_rgba(212,175,55,0.1)]"
            >
              <h3 className="mb-1 text-lg font-bold text-accent" style={{ fontFamily: "var(--font-heading)" }}>
                {promoBanner.title}
              </h3>
              <p className="text-sm text-text-secondary">{promoBanner.subtitle}</p>
            </Link>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ── Activities Grid ── */}
      {isVisible("activities") && (
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <div className="mb-14 text-center">
              <h2
                className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Nos <span className="gold-text">Activités</span>
              </h2>
              <p className="mx-auto max-w-lg text-text-muted">{home.activities_subtitle}</p>
              <div className="section-divider mx-auto mt-6 w-24" />
            </div>
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
      <section className="border-y border-border bg-bg py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <div className="mb-14 text-center">
              <h2
                className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Pourquoi <span className="gold-text">Tayamo ?</span>
              </h2>
              <div className="section-divider mx-auto mt-6 w-24" />
            </div>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featureItems.map((f, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="group rounded-2xl border border-border bg-surface p-7 text-center transition-all duration-500 hover:border-border-accent hover:shadow-[var(--c-shadow-lg)]">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--c-accent-dim)] text-accent transition-all duration-500 group-hover:bg-[var(--c-accent-dim)] group-hover:scale-110">
                    {f.icon}
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-text" style={{ fontFamily: "var(--font-heading)" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed text-text-muted">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Testimonials ── */}
      {isVisible("testimonials") && (
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <div className="mb-14 text-center">
              <h2
                className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Ce que disent nos <span className="gold-text">clients</span>
              </h2>
              <div className="section-divider mx-auto mt-6 w-24" />
            </div>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      {/* ── Nouveautés ── */}
      {isVisible("gallery") && (
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <div className="mb-12 text-center">
              <h2
                className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {isAr ? "آخر " : "Nos "}<span className="gold-text">{isAr ? "الجديد" : "Nouveautés"}</span>
              </h2>
              <p className="mx-auto max-w-lg text-text-muted">
                {isAr ? "آخر الصور والفيديوهات والمنتجات" : "Dernières photos, vidéos et produits ajoutés"}
              </p>
              <div className="section-divider mx-auto mt-6 w-24" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {parsedGalleryImages.slice(0, 6).map((img, i) => (
              <FadeIn key={img.id} delay={i * 80}>
                <Link href={`/${locale}/news?tab=gallery`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </Link>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={400}>
            <div className="mt-10 text-center">
              <Link
                href={`/${locale}/news?tab=gallery`}
                className="inline-flex items-center gap-2 rounded-xl border border-border-accent bg-[var(--c-accent-faint)] px-6 py-3 text-sm font-medium text-accent transition-all duration-300 hover:bg-[var(--c-accent-dim)] hover:border-border-accent"
              >
                {isAr ? "عرض المعرض" : "Voir toute la galerie"}
                <span className="text-[var(--c-accent-muted)]">→</span>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ── Latest Products ── */}
      {latestProducts.length > 0 && (
      <section className="border-t border-border bg-bg py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <div className="mb-14 text-center">
              <h2
                className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {isAr ? "آخر " : "Derniers "}<span className="gold-text">{isAr ? "المنتجات" : "Produits"}</span>
              </h2>
              <p className="mx-auto max-w-lg text-text-muted">
                {isAr ? "اكتشف أحدث المنتجات في متجرنا" : "Découvrez les derniers ajouts à notre boutique"}
              </p>
              <div className="section-divider mx-auto mt-6 w-24" />
            </div>
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latestProducts.map((product, i) => {
              const images = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
              const primaryImage = images[0] || "/products/placeholder-whey.svg";
              return (
                <FadeIn key={product.id} delay={i * 100}>
                  <Link href={`/${locale}/shop/products/${product.slug}`} className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-border-accent hover:shadow-[var(--c-shadow-lg)]">
                    <div className="relative aspect-square overflow-hidden bg-[var(--c-accent-faint)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {product.isNew && (
                        <span className="absolute left-3 top-3 rounded-lg bg-accent px-2.5 py-1 text-[10px] font-bold text-[var(--c-text-on-accent)]">
                          {isAr ? "جديد" : "NEW"}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--c-accent-muted)]">{product.brand}</p>
                      <h3 className="mb-2 line-clamp-2 text-sm font-bold text-text transition-colors group-hover:text-accent">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-accent">{product.price} TND</span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-text-dim line-through">{product.compareAtPrice} TND</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
          <FadeIn delay={400}>
            <div className="mt-10 text-center">
              <Link
                href={`/${locale}/shop/products`}
                className="inline-flex items-center gap-2 rounded-xl border border-border-accent bg-[var(--c-accent-faint)] px-6 py-3 text-sm font-medium text-accent transition-all duration-300 hover:bg-[var(--c-accent-dim)] hover:border-border-accent"
              >
                {isAr ? "عرض المتجر" : "Voir la boutique"}
                <span className="text-[var(--c-accent-muted)]">→</span>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ── Coaches ── */}
      {isVisible("trainers") && <Coaches coaches={activeCoaches} />}

      {/* ── Weekly Schedule ── */}
      <section className="border-t border-border bg-bg py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <FadeIn>
            <div className="mb-14 text-center">
              <h2
                className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Programme de la <span className="gold-text">semaine</span>
              </h2>
              <p className="mx-auto max-w-lg text-text-muted">{home.schedule_subtitle}</p>
              <div className="section-divider mx-auto mt-6 w-24" />
            </div>
          </FadeIn>
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="premium-table w-full text-sm">
              <thead>
                <tr>
                  <th>
                    {isAr ? "اليوم" : "Jour"}
                  </th>
                  <th>
                    {isAr ? "النشاط" : "Activité"}
                  </th>
                  <th className="hidden md:table-cell">
                    {isAr ? "الفئة" : "Catégorie"}
                  </th>
                  <th>
                    {isAr ? "التوقيت" : "Horaire"}
                  </th>
                  <th className="hidden md:table-cell">
                    {isAr ? "المدرب" : "Coach"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dayKeys.map((day) =>
                  groupedSchedules[day].map((s, i) => (
                    <tr key={s.id} className={i === 0 ? "border-t-2 border-border-accent" : ""}>
                      {i === 0 && (
                        <td
                          rowSpan={groupedSchedules[day].length}
                          className="font-semibold text-text align-top"
                        >
                          {dayNames[day][isAr ? 0 : 1]}
                        </td>
                      )}
                      <td>
                        {isAr ? s.activity.nameAr : s.activity.nameFr}
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="inline-block rounded-full bg-[var(--c-accent-dim)] px-3 py-1 text-xs font-medium text-accent">
                          {categoryLabels[s.category as keyof typeof categoryLabels]?.[isAr ? 0 : 1] || s.category}
                        </span>
                      </td>
                      <td>
                        {s.startTime} - {s.endTime}
                      </td>
                      <td className="hidden text-text-muted md:table-cell">
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

      {/* ── Dernières Actualités ── */}
      {latestNews.length > 0 && (
      <section className="border-t border-border bg-bg py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <div className="mb-14 text-center">
              <h2
                className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {isAr ? "آخر " : "Dernières "}<span className="gold-text">{isAr ? "الأخبار" : "Actualités"}</span>
              </h2>
              <p className="mx-auto max-w-lg text-text-muted">
                {isAr ? "تابع آخر أخبار وفعاليات النادي" : "Suivez les dernières nouvelles et événements du club"}
              </p>
              <div className="section-divider mx-auto mt-6 w-24" />
            </div>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {latestNews.map((item, i) => (
              <FadeIn key={item.id} delay={i * 100}>
                <Link href={`/${locale}/news`} className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-border-accent hover:shadow-[var(--c-shadow-lg)]">
                  {item.imageUrl && (
                    <div className="relative aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                      {item.isFeatured && (
                        <span className="absolute left-3 top-3 rounded-lg bg-accent px-2.5 py-1 text-[10px] font-bold text-[var(--c-text-on-accent)]">
                          {isAr ? "مميز" : "Featured"}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2 text-xs text-text-dim">
                      <Calendar size={12} />
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString(isAr ? "ar-TN" : "fr-FR", { day: "numeric", month: "short" })}
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-base font-bold text-text transition-colors group-hover:text-accent">
                      {isAr && item.titleAr ? item.titleAr : item.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-text-muted">
                      {isAr && item.contentAr ? item.contentAr : item.content}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={300}>
            <div className="mt-10 text-center">
              <Link
                href={`/${locale}/news`}
                className="inline-flex items-center gap-2 rounded-xl border border-border-accent bg-[var(--c-accent-faint)] px-6 py-3 text-sm font-medium text-accent transition-all duration-300 hover:bg-[var(--c-accent-dim)] hover:border-border-accent"
              >
                {isAr ? "عرض جميع الأخبار" : "Voir toutes les actualités"}
                <span className="text-[var(--c-accent-muted)]">→</span>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
      )}

      {/* ── Final CTA Banner ── */}
      {isVisible("cta") && (
      <section className="relative overflow-hidden py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-[#1a1500] to-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-5 text-center">
          <FadeIn>
            <h2
              className="mb-6 text-3xl font-bold tracking-tight text-text md:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {home.cta_banner_title}
            </h2>
            <p className="mb-10 text-lg text-text-muted">{home.cta_banner_sub}</p>
            <Link href={`/${locale}/reservation`}>
              <Button variant="accent" size="lg">
                {home.cta_banner_btn}
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
      )}
    </>
  );
}
