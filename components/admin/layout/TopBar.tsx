"use client";

import { useState, useEffect } from "react";
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import Link from "next/link";
import GlobalSearch from "@/components/admin/ui/GlobalSearch";

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function TopBar({ onMenuClick, title }: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/notifications?limit=1")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setUnreadCount(data.unreadCount || 0); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:px-6"
      style={{
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[var(--admin-text-muted)] hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1 className="text-lg font-bold text-white">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-[var(--admin-text-dim)] transition-colors hover:bg-white/[0.05] hover:text-[var(--admin-text-muted)] md:flex"
        >
          Rechercher...
          <kbd className="ml-2 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>

        {/* Notifications */}
        <Link
          href="/admin/notifications"
          className="relative rounded-xl p-2.5 text-[var(--admin-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4a843] px-1 text-[10px] font-bold text-[#0a0a0f]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--admin-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#d4a843] to-[#b8922e] text-xs font-bold text-[#0a0a0f]">
              A
            </div>
            <span className="hidden lg:block">Admin</span>
            <ChevronDown size={14} className={`hidden transition-transform duration-200 lg:block ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div
                className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/5 py-1.5 admin-animate-scale-in"
                style={{
                  background: "rgba(17, 17, 24, 0.95)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                }}
              >
                <div className="border-b border-white/5 px-4 py-3">
                  <p className="text-sm font-semibold text-white">Admin</p>
                  <p className="text-xs text-[var(--admin-text-dim)]">admin@tayamosport.com</p>
                </div>
                <Link
                  href="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--admin-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                >
                  <User size={15} />
                  Profil
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--admin-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Settings size={15} />
                  Paramètres
                </Link>
                <div className="my-1 border-b border-white/5" />
                <button
                  onClick={async () => {
                    await adminFetch("/api/admin/logout");
                    window.location.href = "/admin/login";
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut size={15} />
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
    <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
