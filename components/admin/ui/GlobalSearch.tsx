"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Users, Calendar, DollarSign, ArrowRight, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  description: string;
  type: "member" | "booking" | "payment";
  href: string;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // handled by parent
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [membersRes, bookingsRes, paymentsRes] = await Promise.all([
        adminFetch(`/api/admin/clients?q=${encodeURIComponent(q)}&limit=5`),
        adminFetch(`/api/admin/bookings?q=${encodeURIComponent(q)}&limit=5`),
        adminFetch(`/api/admin/payments?q=${encodeURIComponent(q)}&limit=5`),
      ]);

      const membersData = membersRes.ok ? await membersRes.json() : { data: [] };
      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : { data: [] };
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : { data: [] };

      const mapped: SearchResult[] = [
        ...(membersData.data || []).map((m: Record<string, unknown>) => ({
          id: String(m.id),
          name: String(m.firstName || m.name || "Membre"),
          description: String(m.email || m.phone || ""),
          type: "member" as const,
          href: `/admin/members/${m.id}`,
        })),
        ...(bookingsData.data || []).map((b: Record<string, unknown>) => ({
          id: String(b.id),
          name: String(b.clientName || b.memberName || "Réservation"),
          description: String(b.date || b.activity || ""),
          type: "booking" as const,
          href: "/admin/reservations",
        })),
        ...(paymentsData.data || []).map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.clientName || p.memberName || "Paiement"),
          description: String(p.amount ? `${p.amount} MAD` : p.date || ""),
          type: "payment" as const,
          href: "/admin/payments",
        })),
      ];

      setResults(mapped);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const grouped = {
    member: results.filter((r) => r.type === "member"),
    booking: results.filter((r) => r.type === "booking"),
    payment: results.filter((r) => r.type === "payment"),
  };

  const categoryLabels: Record<string, string> = {
    member: "Membres",
    booking: "Réservations",
    payment: "Paiements",
  };

  const categoryIcons: Record<string, typeof Users> = {
    member: Users,
    booking: Calendar,
    payment: DollarSign,
  };

  const categoryColors: Record<string, string> = {
    member: "text-blue-400",
    booking: "text-emerald-400",
    payment: "text-[#d4a843]",
  };

  const flatResults = [...grouped.member, ...grouped.booking, ...grouped.payment];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <Search size={20} className="shrink-0 text-[var(--admin-text-dim)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un membre, réservation, paiement..."
            className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-[var(--admin-text-dim)]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="rounded-md p-1 text-[var(--admin-text-dim)] hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-[#d4a843]" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-10 text-center text-sm text-[var(--admin-text-dim)]">Aucun résultat</div>
          )}

          {!loading &&
            Object.entries(grouped).map(([type, items]) => {
              if (items.length === 0) return null;
              const Icon = categoryIcons[type];
              const color = categoryColors[type];
              return (
                <div key={type} className="mb-2">
                  <p className="mb-1 px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--admin-text-dim)]">
                    {categoryLabels[type]}
                  </p>
                  {items.map((item) => {
                    const idx = flatResults.indexOf(item);
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={`${type}-${item.id}`}
                        onClick={() => {
                          router.push(item.href);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          isSelected ? "bg-white/[0.03]" : ""
                        }`}
                        style={isSelected ? { outline: "1px solid rgba(212,168,67,0.3)" } : undefined}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ${color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{item.name}</p>
                          {item.description && (
                            <p className="truncate text-xs text-[var(--admin-text-dim)]">{item.description}</p>
                          )}
                        </div>
                        <ArrowRight size={14} className="shrink-0 text-[var(--admin-text-dim)]" />
                      </button>
                    );
                  })}
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-5 py-3">
          <p className="text-center text-[11px] text-[var(--admin-text-dim)]">
            Utilisez <kbd className="mx-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px]">↑</kbd>
            <kbd className="mx-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px]">↓</kbd> pour
            naviguer,{" "}
            <kbd className="mx-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px]">Entrée</kbd> pour
            sélectionner,{" "}
            <kbd className="mx-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px]">Échap</kbd> pour
            fermer
          </p>
        </div>
      </div>
    </div>
  );
}
