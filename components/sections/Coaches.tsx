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
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <h2
            className="mb-4 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Nos Coachs
          </h2>
          <p className="mb-10 text-center text-gray-600">
            Une équipe de professionnels certifiés
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coaches.map((coach, i) => (
            <FadeIn key={coach.id} delay={i * 100}>
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl">
                  <Image
                    src={coach.imageUrl ?? "/images/coaches/default.jpg"}
                    alt={coach.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-primary-dark">
                    {coach.name}
                  </h3>
                  <p className="text-sm font-medium" style={{ color: "#C1121F" }}>
                    {coach.specialty}
                  </p>
                  {parseExperience(coach.bio) && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                      <Award className="h-3.5 w-3.5" />
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
