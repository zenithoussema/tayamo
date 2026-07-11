import { notFound } from "next/navigation";
import { locales, type Locale, isRtl } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionaries";
import { getContactSettings } from "@/lib/contact-settings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const [dict, contactSettings] = await Promise.all([
    getDictionary(locale as Locale),
    getContactSettings(),
  ]);
  const dir = isRtl[locale as Locale] ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={locale}>
      <Header locale={locale as Locale} dictionary={dict} contact={contactSettings} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale as Locale} dictionary={dict} contact={contactSettings} />
    </div>
  );
}
