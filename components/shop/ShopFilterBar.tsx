"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ShopCategory {
  name: string;
  slug: string;
}

interface ShopFilterBarProps {
  categories: ShopCategory[];
  currentCategory?: string;
  currentSort?: string;
  inStockOnly?: boolean;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Best Rating" },
  { value: "best-selling", label: "Best Selling" },
];

export function ShopFilterBar({
  categories,
  currentCategory,
  currentSort = "newest",
  inStockOnly = false,
}: ShopFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortOpen, setSortOpen] = useState(false);

  function buildUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.push(`/shop${qs ? `?${qs}` : ""}`);
  }

  function handleCategorySelect(slug: string) {
    buildUrl({ category: currentCategory === slug ? null : slug });
  }

  function handleSortSelect(value: string) {
    buildUrl({ sort: value });
    setSortOpen(false);
  }

  function handleInStockToggle() {
    buildUrl({ inStock: inStockOnly ? null : "1" });
  }

  const currentSortLabel = sortOptions.find((o) => o.value === currentSort)?.label || "Newest";

  return (
    <div className="flex flex-col gap-4">
      {/* Sort + Stock toggle row */}
      <div className="flex items-center justify-between gap-4">
        {/* In Stock toggle */}
        <button
          onClick={handleInStockToggle}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-300 ${
            inStockOnly
              ? "border-accent/40 bg-accent-dim text-accent"
              : "border-border-strong bg-surface-elevated text-text-muted hover:border-border-strong hover:text-text-secondary"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          In Stock Only
        </button>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface-elevated px-4 py-2.5 text-xs font-semibold text-text-muted transition-all duration-300 hover:border-border-strong hover:text-text-secondary"
          >
            {currentSortLabel}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    className={`flex w-full items-center px-4 py-3 text-xs font-medium transition-all duration-200 ${
                      currentSort === option.value
                        ? "bg-accent-dim text-accent"
                        : "text-text-muted hover:bg-border hover:text-text"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => buildUrl({ category: null })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${
              !currentCategory
                ? "border-accent/40 bg-accent-dim text-accent"
                : "border-border-strong bg-surface-elevated text-text-muted hover:border-border-strong hover:text-text-secondary"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                currentCategory === cat.slug
                  ? "border-accent/40 bg-accent-dim text-accent"
                  : "border-border-strong bg-surface-elevated text-text-muted hover:border-border-strong hover:text-text-secondary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
