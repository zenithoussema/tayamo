"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Newspaper,
  Calendar,
  Play,
  Images,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  titleAr: string | null;
  content: string;
  contentAr: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  category: string;
  featured: boolean;
  type: string;
  videoUrl: string;
}

const CATEGORY_CONFIG: Record<string, { fr: string; ar: string; color: string }> = {
  NEWS: { fr: "Actualités", ar: "أخبار", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  EVENT: { fr: "Événements", ar: "فعاليات", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  ANNOUNCEMENT: { fr: "Annonces", ar: "إعلانات", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  ADMIN_POST: { fr: "Publication", ar: "منشور", color: "bg-green-500/10 text-green-400 border-green-500/20" },
};

const GALLERY_CATEGORIES = ["Tous", "Général", "Équipements", "Cours", "Événements", "Avant/Après"];

function detectLocale() {
  if (typeof window === "undefined") return "fr";
  const path = window.location.pathname;
  if (path.startsWith("/ar")) return "ar";
  return "fr";
}

function ActualitesContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "gallery" ? "gallery" : "news";
  const [activeTab, setActiveTab] = useState<"news" | "gallery">(initialTab as "news" | "gallery");
  const locale = detectLocale();
  const isAr = locale === "ar";

  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryFilter, setGalleryFilter] = useState("Tous");
  const [lightbox, setLightbox] = useState<{ images: GalleryImage[]; index: number } | null>(null);

  const fetchNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const res = await fetch("/api/news?limit=50");
      if (res.ok) setNews(await res.json());
    } catch {}
    setNewsLoading(false);
  }, []);

  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) setGallery(await res.json());
    } catch {}
    setGalleryLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();
    fetchGallery();
  }, [fetchNews, fetchGallery]);

  useEffect(() => {
    setActiveTab(initialTab as "news" | "gallery");
  }, [initialTab]);

  const filteredGallery = galleryFilter === "Tous"
    ? gallery
    : gallery.filter((img) => img.category === galleryFilter);

  const galleryCounts = gallery.reduce(
    (acc, img) => { acc[img.category] = (acc[img.category] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <section className="min-h-screen bg-bg pt-24 pb-24 md:pt-28 md:pb-20">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mb-10 text-center">
          <h1
            className="mb-4 text-4xl font-bold tracking-tight text-text md:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isAr ? "النادي" : "Tayamo"}{" "}
            <span className="gold-text">{isAr ? "الإخباري" : "Actualités"}</span>
          </h1>
          <p className="mx-auto max-w-lg text-text-muted">
            {isAr
              ? "تابع آخر أخبار وفعاليات ومعرض صور النادي"
              : "Suivez les dernières nouvelles, événements et la galerie du club"}
          </p>
          <div className="section-divider mx-auto mt-6 w-24" />
        </div>

        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-2xl border border-border-strong bg-surface p-1">
            <button
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
                activeTab === "news"
                  ? "bg-accent text-text-on-accent shadow-lg shadow-accent/20"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Newspaper size={16} />
              {isAr ? "الأخبار" : "Actualités"}
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
                activeTab === "gallery"
                  ? "bg-accent text-text-on-accent shadow-lg shadow-accent/20"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Images size={16} />
              {isAr ? "المعرض" : "Notre Galerie"}
            </button>
          </div>
        </div>

        {activeTab === "news" && (
          <div>
            {newsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="aspect-video bg-white/[0.03]" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 w-24 rounded bg-white/[0.05]" />
                      <div className="h-6 w-3/4 rounded bg-white/[0.05]" />
                      <div className="h-4 w-full rounded bg-white/[0.03]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : news.length === 0 ? (
              <div className="py-20 text-center">
                <Newspaper size={48} className="mx-auto mb-4 text-text-dim" />
                <p className="text-text-muted">
                  {isAr ? "لا توجد أخبار بعد" : "Aucune actualité pour le moment"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {news.map((item, i) => {
                  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.NEWS;
                  const title = isAr && item.titleAr ? item.titleAr : item.title;
                  const content = isAr && item.contentAr ? item.contentAr : item.content;
                  const date = item.publishedAt || item.createdAt;

                  return (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-white/[0.08] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                    >
                      {item.imageUrl && (
                        <div className="relative aspect-video overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                          {item.videoUrl && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 text-text-on-accent shadow-lg transition-transform group-hover:scale-110">
                                <Play size={28} className="ml-1" fill="currentColor" />
                              </div>
                            </div>
                          )}
                          {item.isFeatured && (
                            <div className="absolute left-4 top-4">
                              <span className="rounded-lg bg-accent/90 px-3 py-1 text-xs font-bold text-text-on-accent backdrop-blur-sm">
                                {isAr ? "مميز" : "Featured"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6 md:p-8">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${cat.color}`}>
                            {isAr ? cat.ar : cat.fr}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Calendar size={12} />
                            {new Date(date).toLocaleDateString(isAr ? "ar-TN" : "fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <h2 className="mb-3 text-xl font-bold text-text md:text-2xl">{title}</h2>
                        <p className="mb-4 leading-relaxed text-text-muted line-clamp-4">{content}</p>
                        {item.videoUrl && (
                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                          >
                            <Play size={14} />
                            {isAr ? "شاهد الفيديو" : "Regarder la vidéo"}
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "gallery" && (
          <div>
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {GALLERY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGalleryFilter(cat)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
                    galleryFilter === cat
                      ? "border-accent/40 bg-accent-dim text-accent"
                      : "border-border-strong bg-white/[0.02] text-text-muted hover:border-border-strong hover:text-text-secondary"
                  }`}
                >
                  {cat}
                  {cat !== "Tous" && galleryCounts[cat] ? (
                    <span className="ml-1.5 text-[10px] opacity-50">({galleryCounts[cat]})</span>
                  ) : cat === "Tous" ? (
                    <span className="ml-1.5 text-[10px] opacity-50">({gallery.length})</span>
                  ) : null}
                </button>
              ))}
            </div>

            {galleryLoading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse aspect-[4/5] rounded-2xl bg-white/[0.03]" />
                ))}
              </div>
            ) : filteredGallery.length === 0 ? (
              <div className="py-20 text-center">
                <Images size={48} className="mx-auto mb-4 text-text-dim" />
                <p className="text-text-muted">
                  {isAr ? "لا توجد صور في هذا القسم" : "Aucune image dans cette catégorie"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {filteredGallery.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setLightbox({ images: filteredGallery, index: i })}
                    className="group relative aspect-[4/5] overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    {img.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white/[0.03]">
                        <Play size={32} className="text-accent-muted" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/80 text-text-on-accent">
                        {img.type === "video" ? <Play size={18} fill="currentColor" /> : <Eye size={18} />}
                      </div>
                    </div>
                    {img.type === "video" && (
                      <div className="absolute bottom-2 right-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                          <Play size={12} fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X size={24} />
          </button>
          {lightbox.index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((prev) => prev ? { ...prev, index: prev.index - 1 } : null);
              }}
              className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {lightbox.index < lightbox.images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((prev) => prev ? { ...prev, index: prev.index + 1 } : null);
              }}
              className="absolute right-16 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight size={24} />
            </button>
          )}
          <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {lightbox.images[lightbox.index].type === "video" && lightbox.images[lightbox.index].videoUrl ? (
              <iframe
                src={lightbox.images[lightbox.index].videoUrl.replace("watch?v=", "embed/")}
                className="h-[70vh] w-[85vw] max-w-[900px] rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : lightbox.images[lightbox.index].url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={lightbox.images[lightbox.index].url}
                alt={lightbox.images[lightbox.index].alt}
                className="max-h-[85vh] rounded-lg object-contain"
              />
            ) : null}
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/50">
            {lightbox.index + 1} / {lightbox.images.length}
          </div>
        </div>
      )}
    </section>
  );
}

export default function ActualitesPage() {
  return (
    <Suspense fallback={
      <section className="min-h-screen bg-bg pt-24 pb-24 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 h-12 w-64 animate-pulse rounded bg-white/[0.05]" />
            <div className="mx-auto h-4 w-80 animate-pulse rounded bg-white/[0.03]" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="aspect-video bg-white/[0.03]" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-24 rounded bg-white/[0.05]" />
                  <div className="h-6 w-3/4 rounded bg-white/[0.05]" />
                  <div className="h-4 w-full rounded bg-white/[0.03]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    }>
      <ActualitesContent />
    </Suspense>
  );
}
