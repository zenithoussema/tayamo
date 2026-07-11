"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Mail,
  MailOpen,
} from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import EmptyState from "@/components/admin/ui/EmptyState";
import { TableSkeleton } from "@/components/admin/ui/Skeleton";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Tabs from "@/components/admin/ui/Tabs";
import { useToast } from "@/components/admin/ui/Toast";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const prevSearchRef = useRef(search);
  const prevFilterRef = useRef(readFilter);
  const limit = 15;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("q", search);
    if (readFilter === "unread") params.set("read", "false");
    if (readFilter === "read") params.set("read", "true");

    try {
      const res = await adminFetch(`/api/admin/notifications?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setNotifications(data.data || []);
      setTotal(data.total || 0);
      setUnreadCount(data.unreadCount || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, readFilter]);

  useEffect(() => {
    if (prevSearchRef.current !== search || prevFilterRef.current !== readFilter) {
      setPage(1);
      prevSearchRef.current = search;
      prevFilterRef.current = readFilter;
      return;
    }
    fetchNotifications();
  }, [fetchNotifications, search, readFilter]);

  const markAsRead = async (id: number) => {
    try {
      const res = await adminFetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      const res = await adminFetch("/api/admin/notifications/mark-all-read", { method: "PATCH" });
      if (res.ok) {
        addToast("Toutes les notifications marquées comme lues", "success");
        fetchNotifications();
      }
    } catch {
      addToast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/notifications/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("Notification supprimée", "success");
      setDeleteId(null);
      fetchNotifications();
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const typeColors: Record<string, string> = {
    PAYMENT: "bg-[var(--admin-success)]/20 text-[var(--admin-success)]",
    BOOKING: "bg-blue-500/20 text-blue-400",
    REMINDER: "bg-[var(--admin-gold)]/20 text-[var(--admin-gold)]",
    SYSTEM: "bg-purple-500/20 text-purple-400",
    ALERT: "bg-[var(--admin-danger)]/20 text-[var(--admin-danger)]",
  };

  const typeLabels: Record<string, string> = {
    PAYMENT: "Paiement",
    BOOKING: "Réservation",
    REMINDER: "Rappel",
    SYSTEM: "Système",
    ALERT: "Alerte",
  };

  const readTabs = [
    { key: "all", label: "Toutes" },
    { key: "unread", label: `Non lues${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { key: "read", label: "Lues" },
  ];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-[var(--admin-danger)] px-2.5 py-0.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} notification{total !== 1 ? "s" : ""} au total</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="admin-btn-ghost flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <CheckCheck size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher..." />
        </div>
        <Tabs tabs={readTabs} active={readFilter} onChange={setReadFilter} />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={fetchNotifications} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">
            Réessayer
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucune notification"
          description={search || readFilter !== "all" ? "Essayez de modifier vos filtres" : "Vous êtes à jour !"}
        />
      ) : (
        <>
          <div className="admin-card overflow-x-auto rounded-2xl">
            <table className="admin-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Type</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Titre</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Message</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Date</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Statut</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id} className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${!n.read ? "bg-white/[0.02]" : ""}`}>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${typeColors[n.type] || "bg-white/5 text-[var(--admin-text)]"}`}>
                        {typeLabels[n.type] || n.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${n.read ? "text-[var(--admin-text)]" : "text-white"}`}>{n.title}</td>
                    <td className="max-w-[300px] truncate px-4 py-3 text-xs text-[var(--admin-text-muted)]">{n.message}</td>
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                      {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {n.read ? (
                        <span className="flex items-center gap-1 text-xs text-[var(--admin-text-dim)]">
                          <MailOpen size={13} /> Lu
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-[var(--admin-gold)]">
                          <Mail size={13} /> Non lu
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="rounded-lg p-1.5 text-[var(--admin-success)] hover:bg-[var(--admin-success)]/10 transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(n.id)}
                          className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors"
                          title="Supprimer"
                        >
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

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer la notification"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette notification ?"
        loading={deleting}
      />
    </div>
  );
}
