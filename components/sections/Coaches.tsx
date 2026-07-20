import Image from "next/image";
import { Award } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

interface CoachData {
  id: number;
  name: string;
  specialty: string;
  imageUrl: string | null;
  bio: string | null;
}

function parseExperience(bioJson: string | null): string {
  if (!bioJson) return "";
  try {
    const parsed = JSON.parse(bioJson);
    return parsed.experience ?? "";
  } catch {
    return "";
  }
}

export function Coaches({ coaches }: { coaches: CoachData[] }) {
  return (
    <section className="border-t border-border bg-bg py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <FadeIn>
          <div className="mb-14 text-center">
            <h2
              className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nos <span className="gold-text">Coachs</span>
            </h2>
            <p className="mx-auto max-w-lg text-text-muted">
              Une équipe de professionnels certifiés
            </p>
            <div className="section-divider mx-auto mt-6 w-24" />
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coaches.map((coach, i) => (
            <FadeIn key={coach.id} delay={i * 100}>
              <div className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-border-accent hover:-translate-y-1 hover:shadow-[var(--c-shadow-lg)]">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={coach.imageUrl ?? "/images/coaches/default.jpg"}
                    alt={coach.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-text" style={{ fontFamily: "var(--font-heading)" }}>
                    {coach.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-accent">
                    {coach.specialty}
                  </p>
                  {parseExperience(coach.bio) && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                      <Award className="h-3.5 w-3.5 text-accent/50" />
                      <span>{parseExperience(coach.bio)}</span>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
