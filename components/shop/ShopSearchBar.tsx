"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface ShopSearchBarProps {
  initialQuery?: string;
  placeholder?: string;
}

export function ShopSearchBar({
  initialQuery = "",
  placeholder = "Search products...",
}: ShopSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/shop");
    }
  }

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed) {
        router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
      } else {
        router.push("/shop");
      }
    }, 400);
  }

  function handleClear() {
    setQuery("");
    router.push("/shop");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className={`relative flex items-center rounded-xl border transition-all duration-300 ${
          isFocused
            ? "border-accent/50 shadow-[0_0_0_3px_var(--c-accent-faint)] bg-surface-elevated"
            : "border-border-strong bg-surface"
        }`}
      >
        <Search className="absolute left-4 h-4.5 w-4.5 text-text-dim" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent py-3.5 pl-11 pr-10 text-sm text-text placeholder:text-text-dim outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors duration-200 hover:bg-surface-elevated hover:text-text-secondary"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
