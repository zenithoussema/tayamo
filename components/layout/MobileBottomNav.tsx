"use client";

import Link from "next/link";
import { Home, ShoppingBag, Newspaper, MessageCircle, CreditCard } from "lucide-react";

interface MobileBottomNavProps {
  locale: string;
  currentPath: string;
}

const navItems = [
  { key: "home", href: "", icon: Home },
  { key: "shop", href: "/shop", icon: ShoppingBag },
  { key: "tarifs", href: "/tarifs", icon: CreditCard },
  { key: "news", href: "/news", icon: Newspaper },
  { key: "contact", href: "/contact", icon: MessageCircle },
];

const navLabels: Record<string, Record<string, string>> = {
  fr: { home: "Accueil", shop: "Boutique", tarifs: "Tarifs", news: "Vie du Club", contact: "Contact" },
  ar: { home: "الرئيسية", shop: "المتجر", tarifs: "الأسعار", news: "حياة النادي", contact: "اتصل بنا" },
};

export function MobileBottomNav({ locale, currentPath }: MobileBottomNavProps) {
  const labels = navLabels[locale] || navLabels.fr;

  function isActive(href: string) {
    const fullPath = `/${locale}${href}`;
    if (href === "") return currentPath === fullPath || currentPath === `/${locale}`;
    return currentPath.startsWith(fullPath);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-surface/95 backdrop-blur-xl border-t border-border-strong">
        <div className="flex items-center justify-around px-1 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {navItems.map(({ key, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={key}
                href={`/${locale}${href}`}
                className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 transition-all duration-300 min-w-[56px]"
              >
                <div className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                  active ? "bg-accent-dim" : ""
                }`}>
                  <Icon
                    className={`h-5 w-5 transition-all duration-300 ${
                      active ? "text-accent" : "text-text-dim"
                    }`}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                </div>
                <span
                  className={`text-[9px] font-medium tracking-wide transition-all duration-300 ${
                    active ? "text-accent" : "text-text-dim"
                  }`}
                >
                  {labels[key]}
                </span>
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
