"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  UserCheck,
  Phone,
  Clock,
  LogOut,
} from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import EmptyState from "@/components/admin/ui/EmptyState";
import { TableSkeleton } from "@/components/admin/ui/Skeleton";
import ExportButton from "@/components/admin/ui/ExportButton";
import Tabs from "@/components/admin/ui/Tabs";
import { useToast } from "@/components/admin/ui/Toast";

interface Attendance {
  id: number;
  checkInTime: string;
  checkOutTime: string | null;
  method: string;
  duration: string | null;
  client?: { id: number; firstName: string; lastName: string; phone: string };
}

export default function AttendancePage() {
  const { addToast } = useToast();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  const prevSearchRef = useRef(search);
  const prevFilterRef = useRef(methodFilter);
  const limit = 10;

  const fetchTodayCount = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/attendance/today?limit=1");
      if (res.ok) {
        const data = await res.json();
        setTodayCount(data.total || 0);
      }
    } catch {}
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("q", search);
    if (methodFilter !== "all") params.set("method", methodFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    try {
      const res = await adminFetch(`/api/admin/attendance?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setRecords(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, methodFilter, dateFrom, dateTo]);

  useEffect(() => {
    (async () => { await fetchTodayCount(); })();
  }, [fetchTodayCount]);

  useEffect(() => {
    if (prevSearchRef.current !== search || prevFilterRef.current !== methodFilter) {
      setPage(1);
      prevSearchRef.current = search;
      prevFilterRef.current = methodFilter;
      return;
    }
    fetchAttendance();
  }, [fetchAttendance, search, methodFilter]);

  useEffect(() => {
    (async () => { await fetchAttendance(); })();
  }, [fetchAttendance, page, dateFrom, dateTo]);

  const handleCheckIn = async () => {
    if (!phone.trim()) {
      addToast("Veuillez entrer un numéro de téléphone", "error");
      return;
    }
    setCheckingIn(true);
    try {
      const res = await adminFetch("/api/admin/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        addToast(`Présence enregistrée pour ${data.client?.firstName || "le client"}`, "success");
        setPhone("");
        fetchAttendance();
        fetchTodayCount();
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.error || "Erreur lors de l'enregistrement", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      const res = await adminFetch(`/api/admin/attendance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkOutTime: new Date().toISOString() }),
      });
      if (res.ok) {
        addToast("Sortie enregistrée", "success");
        fetchAttendance();
      } else {
        addToast("Erreur lors de l'enregistrement de la sortie", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    }
  };

  const methodLabels: Record<string, string> = {
    MANUAL: "Manuel",
    QR_CODE: "QR Code",
    PHONE: "Téléphone",
  };

  const methodTabs = [
    { key: "all", label: "Toutes" },
    { key: "MANUAL", label: "Manuel" },
    { key: "QR_CODE", label: "QR Code" },
    { key: "PHONE", label: "Téléphone" },
  ];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Présences</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            {todayCount} présence{todayCount !== 1 ? "s" : ""} aujourd&apos;hui
          </p>
        </div>
        <ExportButton endpoint="/api/admin/export?type=attendance" filename="presences.csv" label="Exporter CSV" />
      </div>

      <div className="admin-card rounded-2xl p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Enregistrement rapide</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)]" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheckIn()}
              className="admin-input w-full rounded-lg py-2.5 pl-10 pr-3 text-sm text-white"
              placeholder="Numéro de téléphone..."
              disabled={checkingIn}
            />
          </div>
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="admin-btn-gold flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <UserCheck size={16} />
            {checkingIn ? "Enregistrement..." : "Check-in"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un client..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="admin-input rounded-lg px-3 py-2 text-xs text-white" />
            <span className="text-xs text-[var(--admin-text-dim)]">à</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="admin-input rounded-lg px-3 py-2 text-xs text-white" />
          </div>
        </div>
        <Tabs tabs={methodTabs} active={methodFilter} onChange={setMethodFilter} />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={fetchAttendance} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">
            Réessayer
          </button>
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<Clock size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucune présence"
          description={search || methodFilter !== "all" ? "Essayez de modifier vos filtres" : "Les présences apparaîtront ici"}
        />
      ) : (
        <>
          <div className="admin-card overflow-x-auto rounded-2xl">
            <table className="admin-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Heure</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Client</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Méthode</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Durée</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                      {new Date(r.checkInTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      <span className="block text-[10px]">{new Date(r.checkInTime).toLocaleDateString("fr-FR")}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.client ? (
                        <div>
                          <p className="font-medium text-white">{r.client.firstName} {r.client.lastName}</p>
                          <p className="text-xs text-[var(--admin-text-muted)]">{r.client.phone}</p>
                        </div>
                      ) : (
                        <span className="text-[var(--admin-text-dim)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-[var(--admin-text)]">
                        {methodLabels[r.method] || r.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                      {r.duration || (r.checkOutTime ? "—" : "En cours...")}
                    </td>
                    <td className="px-4 py-3">
                      {!r.checkOutTime && (
                        <button
                          onClick={() => handleCheckOut(r.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-[var(--admin-success)]/10 px-3 py-1.5 text-xs font-medium text-[var(--admin-success)] transition-colors hover:bg-[var(--admin-success)]/20"
                          title="Enregistrer la sortie"
                        >
                          <LogOut size={13} /> Sortie
                        </button>
                      )}
                      {r.checkOutTime && (
                        <span className="text-xs text-[var(--admin-text-dim)]">
                          Sortie: {new Date(r.checkOutTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
