"use client";

import { locales, type Locale, localeLabels } from "@/lib/locale";
import { usePathname, useRouter } from "next/navigation";

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(locale: Locale) {
    const segments = pathname.split("/").filter(Boolean);
    if (locales.includes(segments[0] as Locale)) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }
    router.push(`/${segments.join("/")}`);
  }

  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`text-sm font-medium transition-colors ${
            locale === currentLocale
              ? "text-primary underline underline-offset-4"
              : "text-gray-600 hover:text-primary"
          }`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
