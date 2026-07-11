export const locales = ["ar", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeLabels: Record<Locale, string> = {
  ar: "العربية",
  fr: "Français",
};

export const isRtl: Record<Locale, boolean> = {
  ar: true,
  fr: false,
};
