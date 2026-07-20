"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useShopCart } from "@/components/shop/ShopCartProvider";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import type { Locale } from "@/lib/locale";
import type { ContactSettings } from "@/lib/contact-settings";

interface HeaderProps {
  locale: Locale;
  dictionary: Record<string, Record<string, string>>;
  contact: ContactSettings;
}

const navKeys: { key: string; href: string }[] = [
  { key: "home", href: "" },
  { key: "shop", href: "/shop" },
  { key: "planning", href: "/planning" },
  { key: "news", href: "/news" },
  { key: "tarifs", href: "/tarifs" },
  { key: "contact", href: "/contact" },
];

export function Header({ locale, dictionary, contact }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const nav = dictionary.nav;
  const { getCartCount } = useShopCart();
  const cartCount = getCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const otherLocale = locale === "ar" ? "fr" : "ar";

  function switchLocale() {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "ar" || segments[0] === "fr") {
      segments[0] = otherLocale;
    } else {
      segments.unshift(otherLocale);
    }
    window.location.href = `/${segments.join("/")}`;
  }

  const whatsappNumber = contact.whatsapp.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--c-overlay)] backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href={`/${locale}`} className="shrink-0 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-transparent.png"
              alt="Tayamo Sport"
              width={120}
              height={56}
              className="h-auto"
              style={{ maxHeight: 48 }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navKeys.map(({ key, href }) => {
              const isActive = pathname === `/${locale}${href}` || (href === "" && pathname === `/${locale}`);
              return (
                <Link
                  key={key}
                  href={`/${locale}${href}`}
                  className={`relative px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                    isActive
                      ? "text-accent"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  {nav[key]}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-4 bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
            <Link
              href={`/${locale}/shop/cart`}
              className="relative ml-2 p-2 text-text-secondary transition-colors duration-300 hover:text-accent"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-text-on-accent">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
            <Link
              href={`/${locale}/reservation`}
              className="ml-3 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-text-on-accent transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_4px_20px_var(--c-accent-glow)]"
            >
              {nav.reservation_trial}
            </Link>
            <ThemeSwitcher locale={locale} />
            <button
              onClick={switchLocale}
              className="ml-2 rounded-lg border border-border-strong px-3 py-2 text-xs font-semibold uppercase text-text-muted transition-all duration-300 hover:border-accent hover:text-accent"
            >
              {otherLocale}
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeSwitcher locale={locale} />
            <button
              onClick={switchLocale}
              className="rounded-lg border border-border-strong px-3 py-1.5 text-xs font-semibold uppercase text-text-muted"
            >
              {otherLocale}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-text-secondary hover:text-text transition-colors"
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden transition-all duration-500 md:hidden ${
            open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1 border-t border-border bg-[var(--c-overlay)] backdrop-blur-xl px-5 pb-6 pt-4">
            {navKeys.map(({ key, href }) => {
              const isActive = pathname === `/${locale}${href}`;
              return (
                <Link
                  key={key}
                  href={`/${locale}${href}`}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-accent-dim text-accent"
                      : "text-text-secondary hover:bg-accent-faint hover:text-text"
                  }`}
                >
                  {nav[key]}
                </Link>
              );
            })}
            <Link
              href={`/${locale}/reservation`}
              onClick={() => setOpen(false)}
              className="mt-3 rounded-xl bg-accent px-5 py-3.5 text-center text-sm font-bold uppercase tracking-wider text-text-on-accent"
            >
              {nav.reservation_trial}
            </Link>
          </div>
        </div>
      </header>

      {/* WhatsApp floating button - always above mobile nav */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] end-4 z-[55] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.3)] transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_30px_rgba(37,211,102,0.4)] active:scale-95 md:bottom-6 md:end-6 md:h-14 md:w-14"
        aria-label="WhatsApp"
      >
        <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
