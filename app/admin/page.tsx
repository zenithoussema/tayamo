"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Users,
  MessageSquare,
  UserCheck,
  CreditCard,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Bell,
  DollarSign,
  QrCode,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { StatSkeleton } from "@/components/admin/ui/Skeleton";

interface DashboardData {
  stats: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalClients: number;
    totalMessages: number;
    unreadMessages: number;
    totalTestimonials: number;
    pendingTestimonials: number;
    totalCoaches: number;
    totalActivities: number;
    totalGalleryImages: number;
    totalPlans: number;
    totalPayments: number;
    totalRevenue: number;
    monthlyRevenue: number;
    activeClients: number;
    expiringClients: number;
    todayAttendances: number;
    unreadNotifications: number;
  };
  recentBookings: Array<{
    id: number;
    parentName: string;
    childName: string;
    status: string;
    createdAt: string;
    activity: { nameFr: string };
  }>;
  recentMessages: Array<{
    id: number;
    name: string;
    message: string;
    handled: boolean;
    createdAt: string;
  }>;
  recentPayments: Array<{
    id: number;
    amount: number;
    date: string;
    method: string;
    client: { fullName: string };
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        console.error("Failed to load stats:", e);
        setError(e.message || "Erreur de chargement");
      })
      .finally(() => setLoading(false));
  }, []);

  const revenueChartData = useMemo(() => {
    if (!data?.recentPayments) return [];
    const grouped: Record<string, number> = {};
    data.recentPayments.forEach((p) => {
      const d = new Date(p.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
      grouped[d] = (grouped[d] || 0) + p.amount;
    });
    return Object.entries(grouped).map(([date, amount]) => ({
      name: date,
      revenue: amount,
    }));
  }, [data]);

  const activityChartData = useMemo(() => {
    if (!data?.recentBookings) return [];
    const grouped: Record<string, number> = {};
    data.recentBookings.forEach((b) => {
      const d = new Date(b.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
      grouped[d] = (grouped[d] || 0) + 1;
    });
    return Object.entries(grouped).map(([date, count]) => ({
      name: date,
      reservations: count,
    }));
  }, [data]);

  if (loading)
    return (
      <div className="admin-animate-fade-in space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-[var(--admin-text-muted)]">Vue d&apos;ensemble de votre salle de sport</p>
          </div>
        </div>
        <StatSkeleton count={6} />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );

  if (!data) return null;

  const stats = data.stats;
  const recentBookings = data.recentBookings ?? [];
  const recentMessages = data.recentMessages ?? [];
  const recentPayments = data.recentPayments ?? [];

  const topStatCards = [
    {
      key: "totalClients",
      label: "Total Membres",
      icon: Users,
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/10",
    },
    {
      key: "activeClients",
      label: "Membres Actifs",
      icon: CheckCircle,
      gradient: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/10",
    },
    {
      key: "monthlyRevenue",
      label: "Revenus Mensuels (TND)",
      icon: DollarSign,
      gradient: "from-[#d4a843]/20 to-[#b8922e]/5",
      iconColor: "text-[#d4a843]",
      borderColor: "border-[#d4a843]/10",
    },
    {
      key: "todayAttendances",
      label: "Check-ins Aujourd'hui",
      icon: QrCode,
      gradient: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/10",
    },
    {
      key: "pendingBookings",
      label: "Demandes en attente",
      icon: AlertCircle,
      gradient: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/10",
    },
    {
      key: "expiringClients",
      label: "Expire bientôt",
      icon: Clock,
      gradient: "from-rose-500/20 to-rose-600/5",
      iconColor: "text-rose-400",
      borderColor: "border-rose-500/10",
    },
  ];

  const miniStatCards = [
    {
      key: "totalPayments",
      label: "Total Paiements",
      icon: CreditCard,
      color: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
    {
      key: "unreadMessages",
      label: "Messages non lus",
      icon: MessageSquare,
      color: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      key: "unreadNotifications",
      label: "Notifications non lues",
      icon: Bell,
      color: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
    {
      key: "totalCoaches",
      label: "Entraîneurs",
      icon: UserCheck,
      color: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
  ];

  const quickActions = [
    { href: "/admin/payments", label: "Paiements", icon: DollarSign, color: "text-[#d4a843]" },
    { href: "/admin/attendance", label: "Présence", icon: QrCode, color: "text-purple-400" },
    { href: "/admin/activities", label: "Activités", icon: Zap, color: "text-rose-400" },
    { href: "/admin/notifications", label: "Notifications", icon: Bell, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6 admin-animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Vue d&apos;ensemble de votre salle de sport
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-[var(--admin-text-dim)] md:flex">
          <Clock size={14} />
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Top row: 6 stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {topStatCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats] ?? 0;
          return (
            <div
              key={card.key}
              className={`admin-card group relative overflow-hidden p-5 ${card.borderColor}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--admin-text-dim)]">
                      {card.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] ${card.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:bg-white/[0.06]`}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Second row: 4 mini stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {miniStatCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats] ?? 0;
          return (
            <div key={card.key} className="admin-card flex items-center gap-4 p-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
              >
                <Icon size={20} className={card.iconColor} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-[var(--admin-text-dim)]">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue chart from recentPayments */}
        <div className="admin-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Revenus récents</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#d4a843]" />
                Montant (TND)
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a843" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d4a843" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="name"
                  stroke="#4a4a5e"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#4a4a5e"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17, 17, 24, 0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#f0f0f5",
                    fontSize: "13px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                  itemStyle={{ color: "#f0f0f5" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d4a843"
                  strokeWidth={2}
                  fill="url(#goldGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity chart from recentBookings */}
        <div className="admin-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Activité des réservations</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Réservations
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="name"
                  stroke="#4a4a5e"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#4a4a5e"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17, 17, 24, 0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#f0f0f5",
                    fontSize: "13px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                  cursor={{ fill: "rgba(212, 168, 67, 0.05)" }}
                />
                <Bar
                  dataKey="reservations"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent data section: 3 columns */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent bookings */}
        <div className="admin-card">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Réservations récentes</h2>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-1 text-xs font-medium text-[#d4a843] transition-colors hover:text-[#e8c56a]"
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {recentBookings.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--admin-text-dim)]">
                Aucune réservation
              </p>
            ) : (
              recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {b.parentName} → {b.childName}
                    </p>
                    <p className="text-xs text-[var(--admin-text-dim)]">
                      {b.activity.nameFr}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent messages */}
        <div className="admin-card">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Messages récents</h2>
            <Link
              href="/admin/messages"
              className="flex items-center gap-1 text-xs font-medium text-[#d4a843] transition-colors hover:text-[#e8c56a]"
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {recentMessages.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--admin-text-dim)]">
                Aucun message
              </p>
            ) : (
              recentMessages.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{m.name}</p>
                    <p className="truncate text-xs text-[var(--admin-text-dim)]">
                      {m.message}
                    </p>
                  </div>
                  <StatusBadge status={m.handled ? "read" : "unread"} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="admin-card">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Paiements récents</h2>
            <Link
              href="/admin/payments"
              className="flex items-center gap-1 text-xs font-medium text-[#d4a843] transition-colors hover:text-[#e8c56a]"
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {recentPayments.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--admin-text-dim)]">
                Aucun paiement
              </p>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {p.client.fullName}
                    </p>
                    <p className="text-xs text-[var(--admin-text-dim)]">
                      {p.method} — {new Date(p.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 text-sm font-semibold text-[#d4a843]">
                    {p.amount} TND
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Actions rapides</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-200 hover:border-[#d4a843]/20 hover:bg-[#d4a843]/[0.03]"
              >
                <Icon
                  size={18}
                  className={`${action.color} transition-transform duration-200 group-hover:scale-110`}
                />
                <span className="text-sm font-medium text-[var(--admin-text-muted)] transition-colors group-hover:text-white">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
