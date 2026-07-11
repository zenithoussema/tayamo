"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { TableSkeleton } from "@/components/admin/ui/Skeleton";
import Tabs from "@/components/admin/ui/Tabs";
import { useToast } from "@/components/admin/ui/Toast";

const dayLabels: Record<string, string> = {
  MONDAY: "Lundi", TUESDAY: "Mardi", WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi", FRIDAY: "Vendredi", SATURDAY: "Samedi", SUNDAY: "Dimanche",
};

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: string }) {
  if (sortBy !== field) return null;
  return sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

interface Booking {
  id: number;
  parentName: string;
  parentPhone: string;
  childName: string;
  childBirthDate: string | null;
  isTrialSession: boolean;
  status: string;
  createdAt: string;
  activity: { id: number; nameFr: string; nameAr: string };
  schedule: { id: number; dayOfWeek: string; startTime: string; endTime: string; coachName: string } | null;
}

export default function ReservationsPage() {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const prevSearchRef = useRef(search);
  const prevFilterRef = useRef(statusFilter);

  const limit = 10;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      order: sortOrder,
    });
    if (search) params.set("q", search);
    if (statusFilter !== "all") params.set("status", statusFilter);

    try {
      const res = await adminFetch(`/api/admin/bookings?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setBookings(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      console.error("Failed to load bookings:", e);
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setBookings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (prevSearchRef.current !== search || prevFilterRef.current !== statusFilter) {
      setPage(1);
      prevSearchRef.current = search;
      prevFilterRef.current = statusFilter;
      return;
    }
    fetchBookings();
  }, [fetchBookings, search, statusFilter]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const res = await adminFetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      addToast(`Réservation ${status === "CONFIRMED" ? "confirmée" : "annulée"}`, "success");
      fetchBookings();
    } else {
      addToast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/bookings/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("Réservation supprimée", "success");
      setDeleteId(null);
      fetchBookings();
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const statusTabs = [
    { key: "all", label: "Toutes" },
    { key: "PENDING", label: "En attente" },
    { key: "CONFIRMED", label: "Confirmées" },
    { key: "CANCELLED", label: "Annulées" },
  ];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Réservations</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} réservation{total !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un parent, enfant, téléphone..." />
        </div>
        <Tabs tabs={statusTabs} active={statusFilter} onChange={setStatusFilter} />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={fetchBookings} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">
            Réessayer
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucune réservation"
          description={search || statusFilter !== "all" ? "Essayez de modifier vos filtres" : "Les réservations apparaîtront ici"}
        />
      ) : (
        <>
          <div className="admin-card overflow-x-auto rounded-2xl">
            <table className="admin-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="cursor-pointer px-4 py-3 font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors" onClick={() => handleSort("parentName")}>
                    <span className="flex items-center gap-1">Parent <SortIcon field="parentName" sortBy={sortBy} sortOrder={sortOrder} /></span>
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Enfant</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Activité</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Séance</th>
                  <th className="cursor-pointer px-4 py-3 font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors" onClick={() => handleSort("status")}>
                    <span className="flex items-center gap-1">Statut <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} /></span>
                  </th>
                  <th className="cursor-pointer px-4 py-3 font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors" onClick={() => handleSort("createdAt")}>
                    <span className="flex items-center gap-1">Date <SortIcon field="createdAt" sortBy={sortBy} sortOrder={sortOrder} /></span>
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{b.parentName}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{b.parentPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--admin-text)]">{b.childName}</td>
                    <td className="px-4 py-3 text-[var(--admin-text)]">{b.activity.nameFr}</td>
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                      {b.schedule ? `${dayLabels[b.schedule.dayOfWeek] || b.schedule.dayOfWeek} ${b.schedule.startTime}–${b.schedule.endTime}` : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                      {new Date(b.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailBooking(b)} className="rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-[var(--admin-text)] transition-colors" title="Voir détails">
                          <Eye size={15} />
                        </button>
                        {b.status === "PENDING" && (
                          <>
                            <button onClick={() => updateStatus(b.id, "CONFIRMED")} className="rounded-lg p-1.5 text-[var(--admin-success)] hover:bg-[var(--admin-success)]/10 transition-colors" title="Confirmer">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => updateStatus(b.id, "CANCELLED")} className="rounded-lg p-1.5 text-[var(--admin-warning)] hover:bg-[var(--admin-warning)]/10 transition-colors" title="Annuler">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        <button onClick={() => setDeleteId(b.id)} className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors" title="Supprimer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={!!detailBooking} onClose={() => setDetailBooking(null)} title="Détails de la réservation">
        {detailBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Parent</p>
                <p className="text-sm font-medium text-white">{detailBooking.parentName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Téléphone</p>
                <p className="text-sm text-[var(--admin-text)]">{detailBooking.parentPhone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Enfant</p>
                <p className="text-sm text-[var(--admin-text)]">{detailBooking.childName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Date de naissance</p>
                <p className="text-sm text-[var(--admin-text)]">
                  {detailBooking.childBirthDate
                    ? new Date(detailBooking.childBirthDate).toLocaleDateString("fr-FR")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Activité</p>
                <p className="text-sm text-[var(--admin-text)]">{detailBooking.activity.nameFr}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Séance d&apos;essai</p>
                <p className="text-sm text-[var(--admin-text)]">{detailBooking.isTrialSession ? "Oui" : "Non"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Séance</p>
                <p className="text-sm text-[var(--admin-text)]">
                  {detailBooking.schedule
                    ? `${dayLabels[detailBooking.schedule.dayOfWeek]} ${detailBooking.schedule.startTime}–${detailBooking.schedule.endTime} (${detailBooking.schedule.coachName})`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Statut</p>
                <StatusBadge status={detailBooking.status} size="md" />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Date de création</p>
                <p className="text-sm text-[var(--admin-text)]">{new Date(detailBooking.createdAt).toLocaleString("fr-FR")}</p>
              </div>
            </div>
            {detailBooking.status === "PENDING" && (
              <div className="flex gap-3 border-t border-white/5 pt-4">
                <button
                  onClick={() => { updateStatus(detailBooking.id, "CONFIRMED"); setDetailBooking(null); }}
                  className="flex-1 rounded-lg bg-[var(--admin-success)]/20 py-2.5 text-sm font-medium text-[var(--admin-success)] transition-colors hover:bg-[var(--admin-success)]/30"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => { updateStatus(detailBooking.id, "CANCELLED"); setDetailBooking(null); }}
                  className="flex-1 rounded-lg bg-[var(--admin-warning)]/20 py-2.5 text-sm font-medium text-[var(--admin-warning)] transition-colors hover:bg-[var(--admin-warning)]/30"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer la réservation"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette réservation ?"
        loading={deleting}
      />
    </div>
  );
}
