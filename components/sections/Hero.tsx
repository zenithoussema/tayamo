import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  locale: Locale;
  dictionary: Record<string, Record<string, string>>;
}

export function Hero({ locale, dictionary }: HeroProps) {
  const home = dictionary.home;

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-red-800">
      <div className="mx-auto max-w-4xl px-4 text-center text-white">
        <h1
          className="mb-6 text-5xl font-extrabold leading-tight md:text-7xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {home.hero_title}
        </h1>
        <p className="mb-8 text-xl text-gray-200 md:text-2xl">
          {home.hero_subtitle}
        </p>
        <Link href={`/${locale}/reservation`}>
          <Button variant="accent" size="lg">
            {home.cta}
          </Button>
        </Link>
      </div>
    </section>
  );
}
