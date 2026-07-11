"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Shield, AlertTriangle, Trash2, Settings, LogIn, Activity } from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import EmptyState from "@/components/admin/ui/EmptyState";
import { TableSkeleton, StatSkeleton } from "@/components/admin/ui/Skeleton";
import ExportButton from "@/components/admin/ui/ExportButton";
import Tabs from "@/components/admin/ui/Tabs";
import StatCard from "@/components/admin/ui/StatCard";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";

const CHART_COLORS = ["#d4a843", "#22c55e", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899"];
const axisProps = { stroke: "#4a4a5e", tick: { fill: "#7a7a8e", fontSize: 12 } };
const gridProps = { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)" };
const tooltipProps = { contentStyle: { background: "#111118", border: "1px solid #1e1e2a", borderRadius: 12, color: "#f0f0f5" } };

interface AuditEntry {
  id: number;
  action: string;
  entity: string;
  entityId: number | string | null;
  details: string | null;
  user: { id: number; fullName: string; username: string } | null;
  createdAt: string;
}

interface AuditStats {
  totalActions: number;
  actionsToday: number;
  failedLogins: number;
  deletedRecords: number;
  permissionChanges: number;
}

const filterTabs = [
  { key: "all", label: "Tous" },
  { key: "login", label: "Connexions" },
  { key: "delete", label: "Suppressions" },
  { key: "modify", label: "Modifications" },
  { key: "error", label: "Erreurs" },
];

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} jour${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

function getActionStyle(action: string): { dot: string; bg: string; icon: React.ReactNode } {
  const lower = action.toLowerCase();
  if (lower.includes("create") || lower.includes("add") || lower.includes("register"))
    return { dot: "bg-[var(--admin-success)]", bg: "bg-[var(--admin-success)]/10", icon: <Activity size={14} className="text-[var(--admin-success)]" /> };
  if (lower.includes("delete") || lower.includes("remove"))
    return { dot: "bg-[var(--admin-danger)]", bg: "bg-[var(--admin-danger)]/10", icon: <Trash2 size={14} className="text-[var(--admin-danger)]" /> };
  if (lower.includes("update") || lower.includes("edit") || lower.includes("modify"))
    return { dot: "bg-[var(--admin-gold)]", bg: "bg-[var(--admin-gold)]/10", icon: <Settings size={14} className="text-[var(--admin-gold)]" /> };
  if (lower.includes("login") || lower.includes("auth"))
    return { dot: "bg-blue-400", bg: "bg-blue-400/10", icon: <LogIn size={14} className="text-blue-400" /> };
  if (lower.includes("failed") || lower.includes("error") || lower.includes("unauthorized"))
    return { dot: "bg-orange-400", bg: "bg-orange-400/10", icon: <AlertTriangle size={14} className="text-orange-400" /> };
  return { dot: "bg-[var(--admin-text-dim)]", bg: "bg-white/5", icon: <Activity size={14} className="text-[var(--admin-text-muted)]" /> };
}

function actionColor(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes("create") || lower.includes("add") || lower.includes("register")) return "text-[var(--admin-success)]";
  if (lower.includes("delete") || lower.includes("remove")) return "text-[var(--admin-danger)]";
  if (lower.includes("update") || lower.includes("edit") || lower.includes("modify")) return "text-[var(--admin-gold)]";
  if (lower.includes("login") || lower.includes("auth")) return "text-blue-400";
  if (lower.includes("failed") || lower.includes("error") || lower.includes("unauthorized")) return "text-orange-400";
  return "text-[var(--admin-text-muted)]";
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [actionsPerDay, setActionsPerDay] = useState<{ day: string; count: number }[]>([]);
  const [actionsByEntity, setActionsByEntity] = useState<{ entity: string; count: number }[]>([]);
  const prevSearch = useRef("");
  const prevType = useRef(typeFilter);
  const prevStart = useRef(startDate);
  const prevEnd = useRef(endDate);

  const limit = 20;

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await adminFetch("/api/admin/audit?stats=true");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats);
      setActionsPerDay(data.actionsPerDay || []);
      setActionsByEntity(data.actionsByEntity || []);
    } catch {} finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("q", search);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await adminFetch(`/api/admin/audit?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setEntries(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setEntries([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, startDate, endDate]);

  useEffect(() => { (async () => { await fetchStats(); })(); }, [fetchStats]);

  useEffect(() => {
    const sC = prevSearch.current !== search;
    const tC = prevType.current !== typeFilter;
    const stC = prevStart.current !== startDate;
    const enC = prevEnd.current !== endDate;
    prevSearch.current = search;
    prevType.current = typeFilter;
    prevStart.current = startDate;
    prevEnd.current = endDate;
    if (sC || tC || stC || enC) {
      setPage(1);
      return;
    }
    fetchAudit();
  }, [fetchAudit, search, typeFilter, startDate, endDate]);

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Journal d&apos;activité & Surveillance</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} entrée{total !== 1 ? "s" : ""} au total</p>
        </div>
        <ExportButton endpoint="/api/admin/export?type=audit" filename="journal.csv" label="Exporter" />
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Actions aujourd&apos;hui" value={stats.actionsToday} icon={<Activity size={20} />} color="bg-[var(--admin-info)]/15" />
          <StatCard label="Connexions échouées" value={stats.failedLogins} icon={<AlertTriangle size={20} />} color="bg-[var(--admin-warning)]/15" />
          <StatCard label="Enregistrements supprimés" value={stats.deletedRecords} icon={<Trash2 size={20} />} color="bg-[var(--admin-danger)]/15" />
          <StatCard label="Changements de permissions" value={stats.permissionChanges} icon={<Settings size={20} />} color="bg-[var(--admin-gold)]/15" />
        </div>
      )}

      {/* Charts */}
      {!statsLoading && actionsPerDay.length > 0 && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="admin-card rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Actions par jour (7 derniers jours)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={actionsPerDay}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="count" fill="#d4a843" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {actionsByEntity.length > 0 && (
            <div className="admin-card rounded-2xl p-6">
              <h3 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Actions par entité</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={actionsByEntity} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="count" nameKey="entity" label={(props: PieLabelRenderProps & { entity?: string }) => `${props.entity ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`}>
                    {actionsByEntity.map((_: unknown, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipProps} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Rechercher par action ou entité..." />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--admin-text-dim)]">Du</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="admin-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--admin-text-dim)]">Au</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="admin-input" />
          </div>
        </div>
      </div>

      <Tabs tabs={filterTabs} active={typeFilter} onChange={setTypeFilter} />

      {/* Timeline */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={fetchAudit} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">
            Réessayer
          </button>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Shield size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucune entrée"
          description={search || typeFilter !== "all" || startDate || endDate ? "Essayez de modifier vos filtres" : "Le journal d'activité sera rempli automatiquement"}
        />
      ) : (
        <>
          <div className="space-y-2">
            {entries.map((e) => {
              const style = getActionStyle(e.action);
              return (
                <div key={e.id} className={`admin-card flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-white/[0.02]`}>
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                    {style.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-medium ${actionColor(e.action)}`}>{e.action}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="inline-block rounded-lg bg-white/5 px-2 py-0.5 text-xs font-medium text-[var(--admin-text-muted)]">
                            {e.entity}
                          </span>
                          {e.entityId && (
                            <span className="font-mono text-xs text-[var(--admin-text-dim)]">#{e.entityId}</span>
                          )}
                          {e.user && (
                            <span className="text-xs text-[var(--admin-text-dim)]">par {e.user.fullName || e.user.username}</span>
                          )}
                        </div>
                        {e.details && (
                          <p className="mt-1 text-xs text-[var(--admin-text-dim)] truncate max-w-md">{e.details}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-[var(--admin-text-muted)]">{new Date(e.createdAt).toLocaleDateString("fr-FR")}</p>
                        <p className="text-xs text-[var(--admin-text-dim)]">{new Date(e.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                        <p className="mt-0.5 text-[10px] text-[var(--admin-text-dim)]">{relativeTime(e.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
