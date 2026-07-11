"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Users, CreditCard, UserCheck, BarChart3, TrendingUp,
  DollarSign, Activity, Clock, FileText,
} from "lucide-react";
import StatCard from "@/components/admin/ui/StatCard";
import Tabs from "@/components/admin/ui/Tabs";
import ExportButton from "@/components/admin/ui/ExportButton";
import { useToast } from "@/components/admin/ui/Toast";
import { StatSkeleton } from "@/components/admin/ui/Skeleton";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";

const CHART_COLORS = ["#d4a843", "#22c55e", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899"];

interface ReportData {
  stats: Record<string, number>;
  newMembersPerMonth?: Array<{ month: string; count: number }>;
  membersByCategory?: Array<{ name: string; value: number }>;
  membersByActivity?: Array<{ name: string; count: number }>;
  revenuePerMonth?: Array<{ month: string; revenue: number }>;
  revenueByMethod?: Array<{ method: string; revenue: number }>;
  topPayingMembers?: Array<{ name: string; total: number; count: number }>;
  checkInsPerDay?: Array<{ day: string; count: number }>;
  checkInsByHour?: Array<{ hour: string; count: number }>;
  checkInsByMethod?: Array<{ method: string; count: number }>;
  mostActiveMembers?: Array<{ name: string; count: number }>;
  allPlans?: Array<{ id: number; name: string; price: number; durationDays: number; clientCount: number; revenue: number; percentage: number }>;
}

const axisProps = { stroke: "#4a4a5e", tick: { fill: "#7a7a8e", fontSize: 12 } };
const gridProps = { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)" };
const tooltipProps = { contentStyle: { background: "#111118", border: "1px solid #1e1e2a", borderRadius: 12, color: "#f0f0f5" } };

const CATEGORY_LABELS: Record<string, string> = {};

const reportTabs = [
  { key: "members", label: "Membres" },
  { key: "financial", label: "Finances" },
  { key: "attendance", label: "Présence" },
  { key: "subscriptions", label: "Abonnements" },
];

export default function ReportsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("members");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: activeTab });
      if (activeTab !== "subscriptions") {
        params.set("from", from);
        params.set("to", to);
      }
      const res = await adminFetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error("Erreur de chargement");
      const json = await res.json();
      setData(json);
    } catch {
      addToast("Erreur lors du chargement du rapport", "error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab, from, to, addToast]);

  useEffect(() => { (async () => { await fetchReport(); })(); }, [fetchReport]);

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rapports & Analyses</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">Analyses détaillées de votre activité</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--admin-text-dim)]">Du</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--admin-text-dim)]">Au</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="admin-input" />
          </div>
          <button onClick={fetchReport} disabled={loading} className="admin-btn admin-btn-gold">
            <BarChart3 size={16} />
            Générer
          </button>
          <ExportButton endpoint={`/api/admin/reports?type=${activeTab}&from=${from}&to=${to}`} filename={`rapport-${activeTab}.json`} label="Exporter" />
        </div>
      </div>

      <Tabs tabs={reportTabs} active={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><StatSkeleton /><StatSkeleton /><StatSkeleton /></div>
      ) : !data ? (
        <div className="admin-card rounded-xl p-8 text-center text-[var(--admin-text-muted)]">Aucune donnée disponible</div>
      ) : (
        <div className="admin-animate-fade-in">
          {activeTab === "members" && <MembersReport data={data} />}
          {activeTab === "financial" && <FinancialReport data={data} />}
          {activeTab === "attendance" && <AttendanceReport data={data} />}
          {activeTab === "subscriptions" && <SubscriptionsReport data={data} />}
        </div>
      )}
    </div>
  );
}

function MembersReport({ data }: { data: ReportData }) {
  const { stats, newMembersPerMonth, membersByCategory = [], membersByActivity = [] } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Membres actifs" value={stats.activeMembers} icon={<Users size={20} />} color="bg-[var(--admin-success)]/15" />
        <StatCard label="Membres expirés" value={stats.expiredMembers} icon={<Users size={20} />} color="bg-[var(--admin-danger)]/15" />
        <StatCard label="Nouveaux ce mois" value={stats.newThisMonth} icon={<UserCheck size={20} />} color="bg-[var(--admin-gold)]/15" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="admin-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Nouveaux membres par mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={newMembersPerMonth}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="count" fill="#d4a843" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Membres par catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={membersByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name" label={(props: PieLabelRenderProps & { name?: string }) => { const n = props.name ?? ""; return `${CATEGORY_LABELS[n] || n} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`; }}>
                {membersByCategory.map((_: unknown, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipProps} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-card rounded-2xl p-6 xl:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Membres par activité</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={membersByActivity}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function FinancialReport({ data }: { data: ReportData }) {
  const { stats, revenuePerMonth, revenueByMethod, topPayingMembers = [] } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenu total" value={`${stats.totalRevenue.toLocaleString("fr-FR")} DA`} icon={<DollarSign size={20} />} color="bg-[var(--admin-gold)]/15" />
        <StatCard label="Paiement moyen" value={`${stats.averagePayment.toLocaleString("fr-FR")} DA`} icon={<TrendingUp size={20} />} color="bg-[var(--admin-info)]/15" />
        <StatCard label="Nombre de paiements" value={stats.paymentsCount} icon={<CreditCard size={20} />} color="bg-[var(--admin-success)]/15" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="admin-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Revenus par mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenuePerMonth}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a843" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Area type="monotone" dataKey="revenue" stroke="#d4a843" fill="url(#goldGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Revenus par méthode</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByMethod}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="method" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="admin-card rounded-2xl p-6">
        <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Top 10 Membres payants</h3>
        <div className="overflow-x-auto">
          <table className="admin-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">#</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Nom</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Total payé</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Nombre de paiements</th>
              </tr>
            </thead>
            <tbody>
              {topPayingMembers.map((m: { name: string; total: number; count: number }, i: number) => (
                <tr key={i} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-[var(--admin-text-dim)]">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-[var(--admin-text)]">{m.name}</td>
                  <td className="px-4 py-3 text-[var(--admin-gold)]">{m.total.toLocaleString("fr-FR")} DA</td>
                  <td className="px-4 py-3 text-[var(--admin-text-muted)]">{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AttendanceReport({ data }: { data: ReportData }) {
  const { stats, checkInsPerDay = [], checkInsByHour = [], checkInsByMethod = [], mostActiveMembers = [] } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total présences" value={stats.totalCheckIns} icon={<Activity size={20} />} color="bg-[var(--admin-info)]/15" />
        <StatCard label="Moyenne / jour" value={stats.averagePerDay} icon={<BarChart3 size={20} />} color="bg-[var(--admin-gold)]/15" />
        <StatCard label="Heure de pointe" value={stats.peakHour} icon={<Clock size={20} />} color="bg-[var(--admin-success)]/15" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="admin-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Présences par jour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={checkInsPerDay}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Présences par heure</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={checkInsByHour}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="hour" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Line type="monotone" dataKey="count" stroke="#d4a843" strokeWidth={2} dot={{ fill: "#d4a843", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Présences par méthode</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={checkInsByMethod} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count" nameKey="method" label={(props: PieLabelRenderProps & { method?: string }) => `${props.method ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`}>
                {checkInsByMethod.map((_: unknown, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipProps} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="admin-card rounded-2xl p-6">
        <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Top 10 Membres les plus actifs</h3>
        <div className="overflow-x-auto">
          <table className="admin-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">#</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Nom</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Nombre de présences</th>
              </tr>
            </thead>
            <tbody>
              {mostActiveMembers.map((m: { name: string; count: number }, i: number) => (
                <tr key={i} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-[var(--admin-text-dim)]">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-[var(--admin-text)]">{m.name}</td>
                  <td className="px-4 py-3 text-[var(--admin-gold)]">{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubscriptionsReport({ data }: { data: ReportData }) {
  const { stats, allPlans = [] } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Plans actifs" value={stats.totalPlans} icon={<FileText size={20} />} color="bg-[var(--admin-gold)]/15" />
        <StatCard label="Revenu total plans" value={`${stats.totalRevenue.toLocaleString("fr-FR")} DA`} icon={<DollarSign size={20} />} color="bg-[var(--admin-success)]/15" />
        <StatCard label="Durée moyenne" value={`${stats.averageDuration} jours`} icon={<Clock size={20} />} color="bg-[var(--admin-info)]/15" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="admin-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Popularité des plans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={allPlans}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="clientCount" fill="#d4a843" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-card rounded-2xl p-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Revenu par plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={allPlans}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="admin-card rounded-2xl p-6">
        <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Détails des plans</h3>
        <div className="overflow-x-auto">
          <table className="admin-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Plan</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Prix</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Durée</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Membres</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Revenu</th>
                <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Part</th>
              </tr>
            </thead>
            <tbody>
              {allPlans.map((p: { id: number; name: string; price: number; durationDays: number; clientCount: number; revenue: number; percentage: number }) => (
                <tr key={p.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-[var(--admin-text)]">{p.name}</td>
                  <td className="px-4 py-3 text-[var(--admin-text-muted)]">{p.price.toLocaleString("fr-FR")} DA</td>
                  <td className="px-4 py-3 text-[var(--admin-text-muted)]">{p.durationDays} jours</td>
                  <td className="px-4 py-3 text-[var(--admin-gold)]">{p.clientCount}</td>
                  <td className="px-4 py-3 text-[var(--admin-success)]">{p.revenue.toLocaleString("fr-FR")} DA</td>
                  <td className="px-4 py-3 text-[var(--admin-text-muted)]">{p.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
