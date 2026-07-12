import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/locale";
import { Card } from "./Card";
import { Badge } from "./Badge";


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
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="relative h-72 w-full overflow-hidden rounded-t-2xl">
        <Image
          src={imgSrc || `/images/activities/${slug}.jpg`}
          alt={`${name} Tayamo Sport`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-primary-dark">{name}</h3>
          <Badge>{ageText}</Badge>
        </div>
        <p className="line-clamp-2 text-sm text-gray-600">{description}</p>
        <div className="mt-auto flex items-center gap-3 pt-2">
          <Link
            href={`/${locale}/reservation`}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-primary-dark transition-colors hover:bg-yellow-500"
          >
            {dictionary.trial}
          </Link>
          <Link
            href={`/${locale}/activities/${slug}`}
            className="text-xs font-medium text-primary transition-colors hover:text-red-700"
          >
            {dictionary.learn_more} &larr;
          </Link>
        </div>
      </div>
    </Card>
  );
}
