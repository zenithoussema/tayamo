"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-fetch";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  UserCheck,
  MessageSquare,
  Image as ImageIcon,
  Quote,
  Settings,
  User,
  X,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Activity,
  Bell,
  Clock,
  DollarSign,
  QrCode,
  MessageCircle,
  ScrollText,
  BarChart3,
  Database,
  Layout,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon?: typeof LayoutDashboard;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  children?: NavItem[];
};

interface ActivityItem {
  nameFr: string;
  slug: string;
}

const staticGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Website Management",
    icon: Layout,
    children: [
      { href: "/admin/cms", label: "Homepage", icon: Layout },
      { href: "/admin/activities", label: "Activities", icon: Activity },
      { href: "/admin/coaches", label: "Trainers", icon: UserCheck },
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare },
      { href: "/admin/schedules", label: "Schedules", icon: Clock },
    ],
  },
  {
    label: "Reservations",
    icon: Calendar,
    href: "/admin/reservations",
  },
  {
    label: "Subscriptions",
    icon: CreditCard,
    href: "/admin/subscriptions",
  },
  {
    label: "Finance",
    icon: DollarSign,
    children: [
      { href: "/admin/payments", label: "Payments", icon: DollarSign },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    icon: Bell,
    children: [
      { href: "/admin/attendance", label: "Attendance", icon: QrCode },
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
      { href: "/admin/feedback", label: "Feedback", icon: MessageCircle },
      { href: "/admin/backup", label: "Backup", icon: Database },
      { href: "/admin/audit", label: "Activity Log", icon: ScrollText },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { href: "/admin/settings", label: "General Settings", icon: Settings },
      { href: "/admin/profile", label: "Profile", icon: User },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    adminFetch("/api/admin/activities/sidebar")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setActivities(data || []))
      .catch(() => {});
  }, []);

  const membersGroup: NavGroup = useMemo(() => ({
    label: "Members",
    icon: Users,
    children: [
      { href: "/admin/members", label: "All Members", icon: Users, exact: true },
      ...activities.map((a) => ({
        href: `/admin/members/activity/${encodeURIComponent(a.slug)}`,
        label: a.nameFr,
        icon: Activity,
      })),
    ],
  }), [activities]);

  const navGroups: NavGroup[] = useMemo(() => [
    staticGroups[0],
    membersGroup,
    ...staticGroups.slice(1),
  ], [membersGroup]);

  const isActive = useCallback((href: string, exact?: boolean) => {
    if (exact) {
      return pathname + (typeof window !== "undefined" ? window.location.search : "") === href || pathname === href;
    }
    return pathname === href || pathname.startsWith(href);
  }, [pathname]);

  const isGroupActive = useCallback((group: NavGroup) => {
    if (group.href) return isActive(group.href, true);
    return group.children?.some((child) => isActive(child.href, child.exact)) ?? false;
  }, [isActive]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      if (group.children && isGroupActive(group)) {
        init[group.label] = true;
      }
    });
    return init;
  });

  const toggleGroup = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href, item.exact);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onMobileClose}
        title={collapsed ? item.label : undefined}
        className={`group mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          collapsed ? "justify-center" : ""
        } ${
          active
            ? "bg-gradient-to-r from-[#d4a843]/15 to-[#d4a843]/5 text-[#d4a843] shadow-sm"
            : "text-[var(--admin-text-muted)] hover:bg-white/[0.03] hover:text-white"
        }`}
      >
        {Icon && (
          <Icon
            size={18}
            className={`shrink-0 transition-colors duration-200 ${
              active ? "text-[#d4a843]" : "text-[var(--admin-text-dim)] group-hover:text-[var(--admin-text-muted)]"
            }`}
          />
        )}
        {!collapsed && <span>{item.label}</span>}
        {active && !collapsed && (
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d4a843] shadow-sm shadow-[#d4a843]/50" />
        )}
      </Link>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const active = group.href ? isActive(group.href, true) : isGroupActive(group);
    const isOpen = expanded[group.label] ?? false;
    const Icon = group.icon;

    if (!group.children || group.children.length === 0) {
      return (
        <div key={group.label} className="mb-1">
          {renderItem({ href: group.href!, label: group.label, icon: Icon, exact: true })}
        </div>
      );
    }

    if (collapsed) {
      return (
        <div key={group.label} className="mb-1">
          <Link
            href={group.children[0].href}
            onClick={onMobileClose}
            title={group.label}
            className={`group mb-0.5 flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-[#d4a843]/15 to-[#d4a843]/5 text-[#d4a843] shadow-sm"
                : "text-[var(--admin-text-muted)] hover:bg-white/[0.03] hover:text-white"
            }`}
          >
            <Icon
              size={18}
              className={`shrink-0 transition-colors duration-200 ${
                active ? "text-[#d4a843]" : "text-[var(--admin-text-dim)] group-hover:text-[var(--admin-text-muted)]"
              }`}
            />
          </Link>
        </div>
      );
    }

    return (
      <div key={group.label} className="mb-1">
        <button
          onClick={() => toggleGroup(group.label)}
          className={`group mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            active
              ? "bg-gradient-to-r from-[#d4a843]/15 to-[#d4a843]/5 text-[#d4a843] shadow-sm"
              : "text-[var(--admin-text-muted)] hover:bg-white/[0.03] hover:text-white"
          }`}
        >
          <Icon
            size={18}
            className={`shrink-0 transition-colors duration-200 ${
              active ? "text-[#d4a843]" : "text-[var(--admin-text-dim)] group-hover:text-[var(--admin-text-muted)]"
            }`}
          />
          <span className="flex-1 text-left">{group.label}</span>
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-0" : "-rotate-90"
            } ${active ? "text-[#d4a843]/60" : "text-[var(--admin-text-dim)]"}`}
          />
          {active && (
            <div className="ml-1 h-1.5 w-1.5 rounded-full bg-[#d4a843] shadow-sm shadow-[#d4a843]/50" />
          )}
        </button>

        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-2 border-l border-white/5 pl-2">
            {group.children.map((child) => renderItem(child))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{
          background: "linear-gradient(180deg, #0d0d14 0%, #0a0a0f 50%, #08080d 100%)",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Brand */}
        <div className={`flex h-16 items-center px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#d4a843] to-[#b8922e] text-sm font-black text-[#0a0a0f] shadow-lg shadow-[#d4a843]/20">
                T
              </div>
              <div>
                <span className="text-sm font-bold tracking-wider text-white">TAYAMO</span>
                <span className="ml-1 text-[10px] font-medium tracking-widest text-[#d4a843]">SPORT</span>
              </div>
            </Link>
          ) : (
            <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#d4a843] to-[#b8922e] text-sm font-black text-[#0a0a0f] shadow-lg shadow-[#d4a843]/20">
              T
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={onMobileClose}
              className="rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:text-white lg:hidden"
            >
              <X size={16} />
            </button>
            <button
              onClick={onToggle}
              hidden={mobileOpen}
              className="hidden rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:text-white lg:block"
            >
              <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group) => renderGroup(group))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/5 p-3">
          <button
            onClick={async () => {
              await adminFetch("/api/admin/logout");
              window.location.href = "/admin/login";
            }}
            title={collapsed ? "Logout" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--admin-text-dim)] transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
