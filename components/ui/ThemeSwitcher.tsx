"use client";

import { useTheme, type ThemeId } from "@/components/providers/ThemeProvider";
import { Palette } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const themes: { id: ThemeId; label: string; labelAr: string; colors: string[] }[] = [
  {
    id: "gold",
    label: "Premium Gold",
    labelAr: "الذهبي الفاخر",
    colors: ["#000000", "#D4AF37", "#111111"],
  },
  {
    id: "classic",
    label: "Classic Gym",
    labelAr: "الصاله الكلاسيكيه",
    colors: ["#f8f8f8", "#dc2626", "#ffffff"],
  },
];

export function ThemeSwitcher({ locale = "fr" }: { locale?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-2 text-xs font-semibold text-text-secondary transition-all duration-300 hover:border-accent hover:text-accent"
        aria-label="Change theme"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">
          {locale === "ar" ? "الثيم" : "Thème"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[60] mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="p-1.5">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                  theme === t.id
                    ? "bg-accent-dim text-accent"
                    : "text-text-secondary hover:bg-surface-hover"
                }`}
              >
                <div className="flex shrink-0 gap-1">
                  {t.colors.map((c, i) => (
                    <span
                      key={i}
                      className="block h-4 w-4 rounded-full border border-border-strong"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">{t.label}</span>
                  <span className="text-[10px] text-text-muted">
                    {locale === "ar" ? t.labelAr : t.label}
                  </span>
                </div>
                {theme === t.id && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
