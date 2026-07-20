import Image from "next/image";
import { Award } from "lucide-react";
import { prisma } from "@/lib/db";
import { FadeIn } from "@/components/ui/FadeIn";

interface CoachSocial {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

interface CoachMeta {
  id: number;
  name: string;
  specialty: string;
  imageUrl: string | null;
  bio: string;
  experience: number;
  certifications: string;
  social: CoachSocial;
}

function parseCoachBio(bioField: string | null): {
  bio: string;
  experience: number;
  certifications: string;
  social: CoachSocial;
} {
  if (!bioField) return { bio: "", experience: 0, certifications: "", social: {} };
  try {
    const parsed = JSON.parse(bioField);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        bio: parsed.bio ?? "",
        experience: parsed.experience ?? 0,
        certifications: parsed.certifications ?? "",
        social: parsed.social ?? {},
      };
    }
  } catch {}
  return { bio: bioField, experience: 0, certifications: "", social: {} };
}

export default async function TrainersPage() {
  const coaches = await prisma.coach.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const trainers: CoachMeta[] = coaches.map((c) => {
    const meta = parseCoachBio(c.bio);
    return {
      id: c.id,
      name: c.name,
      specialty: c.specialty,
      imageUrl: c.imageUrl,
      bio: meta.bio,
      experience: meta.experience,
      certifications: meta.certifications,
      social: meta.social,
    };
  });

  return (
    <section className="min-h-screen pt-28 pb-20 lg:pt-32 lg:pb-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <FadeIn>
          <div className="mb-14 text-center">
            <h1
              className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nos <span className="gold-text">Entraîneurs</span>
            </h1>
            <p className="mx-auto max-w-lg text-text-muted">
              Une équipe de professionnels certifiés à votre service
            </p>
            <div className="section-divider mx-auto mt-6 w-24" />
          </div>
        </FadeIn>

        {trainers.length === 0 ? (
          <FadeIn>
            <div className="py-16 text-center">
              <p className="text-text-dim">
                Aucun entraîneur disponible pour le moment.
              </p>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trainers.map((t, i) => (
              <FadeIn key={t.id} delay={i * 100}>
                <div className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-accent/20 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    {t.imageUrl ? (
                      <Image
                        src={t.imageUrl}
                        alt={t.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-5xl font-bold text-text-dim">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-text" style={{ fontFamily: "var(--font-heading)" }}>
                      {t.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-accent">
                      {t.specialty}
                    </p>

                    {t.experience > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                        <Award className="h-3.5 w-3.5 text-accent-muted" />
                        <span>
                          {t.experience} an{t.experience > 1 ? "s" : ""}{" "}
                          d&apos;expérience
                        </span>
                      </div>
                    )}

                    {t.bio && (
                      <p className="mt-2 line-clamp-2 text-sm text-text-dim">
                        {t.bio}
                      </p>
                    )}

                    {(t.social.facebook || t.social.instagram || t.social.tiktok) && (
                      <div className="mt-4 flex items-center gap-2">
                        {t.social.facebook && (
                          <a
                            href={t.social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-text-dim transition-colors hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
                            title="Facebook"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </a>
                        )}
                        {t.social.instagram && (
                          <a
                            href={t.social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-text-dim transition-colors hover:bg-[#E4405F]/10 hover:text-[#E4405F]"
                            title="Instagram"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                          </a>
                        )}
                        {t.social.tiktok && (
                          <a
                            href={t.social.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-text-dim transition-colors hover:bg-white/5 hover:text-white"
                            title="TikTok"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.3z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
