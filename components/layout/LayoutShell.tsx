"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ShopCartProvider } from "@/components/shop/ShopCartProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import type { Locale } from "@/lib/locale";
import type { ContactSettings } from "@/lib/contact-settings";

interface LayoutShellProps {
  locale: Locale;
  dictionary: Record<string, Record<string, string>>;
  contact: ContactSettings;
  children: React.ReactNode;
}

export function LayoutShell({ locale, dictionary, contact, children }: LayoutShellProps) {
  const pathname = usePathname();

  return (
    <ThemeProvider>
      <ShopCartProvider>
        <Header locale={locale} dictionary={dictionary} contact={contact} />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer locale={locale} dictionary={dictionary} contact={contact} />
        <MobileBottomNav locale={locale} currentPath={pathname} />
      </ShopCartProvider>
    </ThemeProvider>
  );
}
