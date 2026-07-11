"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, QrCode, MessageSquare, MoreHorizontal, CreditCard, DollarSign, Bell, Settings, X } from "lucide-react";

const mainItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Membres", icon: Users },
  { href: "/admin/attendance", label: "Présence", icon: QrCode },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];

const moreItems = [
  { href: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
  { href: "/admin/payments", label: "Paiements", icon: DollarSign },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* More popup */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMoreOpen(false)} />
          <div
            className="fixed bottom-20 right-4 z-50 w-48 overflow-hidden rounded-xl md:hidden"
            style={{
              background: "rgba(10, 10, 15, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <span className="text-xs font-semibold text-white">Plus</span>
              <button onClick={() => setMoreOpen(false)} className="text-[var(--admin-text-dim)] hover:text-white">
                <X size={14} />
              </button>
            </div>
            {moreItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    active ? "bg-[#d4a843]/10 text-[#d4a843]" : "text-[var(--admin-text-muted)] hover:bg-white/[0.03] hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around md:hidden"
        style={{
          height: 64,
          background: "rgba(10, 10, 15, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {mainItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
            >
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${active ? "bg-[#d4a843]/10" : ""}`}>
                <Icon size={20} className={active ? "text-[#d4a843]" : "text-[var(--admin-text-dim)]"} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-[#d4a843]" : "text-[var(--admin-text-dim)]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Plus button */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
        >
          <div className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${moreOpen ? "bg-[#d4a843]/10" : ""}`}>
            <MoreHorizontal size={20} className={moreOpen ? "text-[#d4a843]" : "text-[var(--admin-text-dim)]"} />
          </div>
          <span className={`text-[10px] font-medium ${moreOpen ? "text-[#d4a843]" : "text-[var(--admin-text-dim)]"}`}>
            Plus
          </span>
        </button>
      </nav>
    </>
  );
}
