import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/locale";
import { Badge } from "./Badge";
import { ArrowRight } from "lucide-react";

interface ActivityCardProps {
  locale: Locale;
  name: string;
  slug: string;
  description: string;
  ageRangeMin: number;
  ageRangeMax: number;
  iconName?: string | null;
  imgSrc?: string | null;
  dictionary: Record<string, string>;
}

export function ActivityCard({
  locale,
  name,
  slug,
  description,
  ageRangeMin,
  ageRangeMax,
  imgSrc,
  dictionary,
}: ActivityCardProps) {
  const ageText = dictionary.age_range
    .replace("%min%", String(ageRangeMin))
    .replace("%max%", String(ageRangeMax));

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-surface border border-border transition-all duration-500 hover:border-border-accent hover:shadow-[var(--c-shadow-lg)]">
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={imgSrc || `/images/activities/${slug}.jpg`}
          alt={`${name} Tayamo Sport`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute top-4 right-4">
          <Badge>{ageText}</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6">
        <h3 className="text-xl font-bold tracking-tight text-text" style={{ fontFamily: "var(--font-heading)" }}>
          {name}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">{description}</p>
        <div className="mt-auto flex items-center gap-4 pt-2">
          <Link
            href={`/${locale}/reservation`}
            className="rounded-lg bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--c-text-on-accent)] transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
          >
            {dictionary.trial}
          </Link>
          <Link
            href={`/${locale}/planning`}
            className="group/link flex items-center gap-2 text-xs font-semibold text-accent/70 transition-colors duration-300 hover:text-accent"
          >
            {dictionary.learn_more}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
