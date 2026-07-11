"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  MessageSquare,
  Eye,
  Reply,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { TableSkeleton } from "@/components/admin/ui/Skeleton";
import Tabs from "@/components/admin/ui/Tabs";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { useToast } from "@/components/admin/ui/Toast";

interface Feedback {
  id: number;
  type: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  member?: { id: number; firstName: string; lastName: string; phone: string };
}

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: string }) {
  if (sortBy !== field) return null;
  return sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

export default function FeedbackPage() {
  const { addToast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<Feedback | null>(null);
  const [replyItem, setReplyItem] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const prevSearchRef = useRef(search);
  const prevFilterRef = useRef(statusFilter);
  const limit = 10;

  const fetchFeedbacks = useCallback(async () => {
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
      const res = await adminFetch(`/api/admin/feedback?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setFeedbacks(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setFeedbacks([]);
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
    fetchFeedbacks();
  }, [fetchFeedbacks, search, statusFilter]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setStatusUpdatingId(id);
    try {
      const res = await adminFetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        addToast("Statut mis à jour", "success");
        fetchFeedbacks();
      } else {
        addToast("Erreur lors de la mise à jour", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleReply = async () => {
    if (!replyItem || !replyText.trim()) return;
    setReplying(true);
    try {
      const res = await adminFetch(`/api/admin/feedback/${replyItem.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      if (res.ok) {
        addToast("Réponse envoyée", "success");
        setReplyItem(null);
        setReplyText("");
        fetchFeedbacks();
      } else {
        addToast("Erreur lors de l'envoi", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/feedback/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("Feedback supprimé", "success");
      setDeleteId(null);
      fetchFeedbacks();
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const typeLabels: Record<string, string> = {
    REVIEW: "Avis",
    SUGGESTION: "Suggestion",
    COMPLAINT: "Plainte",
  };

  const typeColors: Record<string, string> = {
    REVIEW: "bg-blue-500/20 text-blue-400",
    SUGGESTION: "bg-purple-500/20 text-purple-400",
    COMPLAINT: "bg-[var(--admin-danger)]/20 text-[var(--admin-danger)]",
  };

  const statusTabs = [
    { key: "all", label: "Tous" },
    { key: "PENDING", label: "En attente" },
    { key: "REVIEWED", label: "Examinés" },
    { key: "SOLVED", label: "Résolus" },
  ];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Feedbacks</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} feedback{total !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un membre, sujet..." />
        </div>
        <Tabs tabs={statusTabs} active={statusFilter} onChange={setStatusFilter} />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={fetchFeedbacks} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">
            Réessayer
          </button>
        </div>
      ) : feedbacks.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucun feedback"
          description={search || statusFilter !== "all" ? "Essayez de modifier vos filtres" : "Les feedbacks apparaîtront ici"}
        />
      ) : (
        <>
          <div className="admin-card overflow-x-auto rounded-2xl">
            <table className="admin-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="cursor-pointer px-4 py-3 font-medium text-[var(--admin-text-muted)] hover:text-white transition-colors" onClick={() => handleSort("createdAt")}>
                    <span className="flex items-center gap-1">Date <SortIcon field="createdAt" sortBy={sortBy} sortOrder={sortOrder} /></span>
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Membre</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Type</th>
                  <th className="cursor-pointer px-4 py-3 font-medium text-[var(--admin-text-muted)] hover:text-white transition-colors" onClick={() => handleSort("subject")}>
                    <span className="flex items-center gap-1">Sujet <SortIcon field="subject" sortBy={sortBy} sortOrder={sortOrder} /></span>
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Statut</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f) => (
                  <tr key={f.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                      {new Date(f.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {f.member ? (
                        <div>
                          <p className="font-medium text-white">{f.member.firstName} {f.member.lastName}</p>
                          <p className="text-xs text-[var(--admin-text-muted)]">{f.member.phone}</p>
                        </div>
                      ) : (
                        <span className="text-[var(--admin-text-dim)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${typeColors[f.type] || "bg-white/5 text-[var(--admin-text)]"}`}>
                        {typeLabels[f.type] || f.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{f.subject}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailItem(f)} className="rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-white transition-colors" title="Voir détails">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => { setReplyItem(f); setReplyText(f.adminReply || ""); }} className="rounded-lg p-1.5 text-[var(--admin-gold)] hover:bg-[var(--admin-gold)]/10 transition-colors" title="Répondre">
                          <Reply size={15} />
                        </button>
                        {statusUpdatingId === f.id ? (
                          <span className="px-2 text-xs text-[var(--admin-text-dim)]">...</span>
                        ) : (
                          <select
                            value={f.status}
                            onChange={(e) => updateStatus(f.id, e.target.value)}
                            className="admin-select rounded-md px-2 py-1 text-xs"
                            title="Changer le statut"
                          >
                            <option value="PENDING">En attente</option>
                            <option value="REVIEWED">Examiné</option>
                            <option value="SOLVED">Résolu</option>
                            <option value="DISMISSED">Ignoré</option>
                          </select>
                        )}
                        <button onClick={() => setDeleteId(f.id)} className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors" title="Supprimer">
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

      <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title="Détails du feedback">
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Membre</p>
                <p className="text-sm font-medium text-white">
                  {detailItem.member ? `${detailItem.member.firstName} ${detailItem.member.lastName}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Téléphone</p>
                <p className="text-sm text-[var(--admin-text)]">{detailItem.member?.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Type</p>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${typeColors[detailItem.type] || ""}`}>
                  {typeLabels[detailItem.type] || detailItem.type}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--admin-text-dim)]">Statut</p>
                <StatusBadge status={detailItem.status} size="md" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--admin-text-dim)]">Sujet</p>
              <p className="text-sm font-medium text-white">{detailItem.subject}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--admin-text-dim)]">Message</p>
              <p className="whitespace-pre-wrap text-sm text-[var(--admin-text)]">{detailItem.message}</p>
            </div>
            {detailItem.adminReply && (
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-xs font-medium text-[var(--admin-gold)]">Réponse admin</p>
                <p className="whitespace-pre-wrap text-sm text-[var(--admin-text)]">{detailItem.adminReply}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-[var(--admin-text-dim)]">Date</p>
              <p className="text-sm text-[var(--admin-text)]">{new Date(detailItem.createdAt).toLocaleString("fr-FR")}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!replyItem} onClose={() => { setReplyItem(null); setReplyText(""); }} title={`Répondre à ${replyItem?.member?.firstName || "ce membre"}`}>
        {replyItem && (
          <div className="space-y-4">
            <div className="rounded-lg bg-white/[0.03] p-3">
              <p className="text-xs font-medium text-[var(--admin-text-dim)]">Message original</p>
              <p className="text-sm text-[var(--admin-text)]">{replyItem.message}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-text-muted)]">Votre réponse</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="admin-input w-full rounded-lg px-3 py-2.5 text-sm text-white"
                rows={5}
                placeholder="Écrivez votre réponse..."
              />
            </div>
            <div className="flex gap-3 border-t border-white/5 pt-4">
              <button
                onClick={() => { setReplyItem(null); setReplyText(""); }}
                className="admin-btn-ghost flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReply}
                disabled={replying || !replyText.trim()}
                className="admin-btn-gold flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {replying ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le feedback"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce feedback ?"
        loading={deleting}
      />
    </div>
  );
}
