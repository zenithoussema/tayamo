"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { MessageSquare, Trash2, CheckCircle, Eye } from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { TableSkeleton } from "@/components/admin/ui/Skeleton";
import Tabs from "@/components/admin/ui/Tabs";
import { useToast } from "@/components/admin/ui/Toast";

interface Message {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  activityInterest: string | null;
  handled: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailMsg, setDetailMsg] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const prevSearch = useRef("");
  const prevFilter = useRef("all");

  const limit = 10;

  const fetchMessages = useCallback(async (p: number, q: string, f: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q) params.set("q", q);
      if (f === "unread") params.set("handled", "false");
      if (f === "read") params.set("handled", "true");
      const res = await adminFetch(`/api/admin/messages?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setMessages(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setMessages([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sc = prevSearch.current !== search;
    const fc = prevFilter.current !== filter;
    prevSearch.current = search;
    prevFilter.current = filter;
    if (sc || fc) { setPage(1); return; }
    fetchMessages(page, search, filter);
  }, [fetchMessages, page, search, filter]);

  const handleSearch = (val: string) => { prevSearch.current = search; setSearch(val); setPage(1); };
  const handleFilter = (val: string) => { prevFilter.current = filter; setFilter(val); setPage(1); };

  const markAsRead = async (id: number) => {
    const res = await adminFetch(`/api/admin/messages/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handled: true }) });
    if (res.ok) { addToast("Message marqué comme lu", "success"); fetchMessages(page, search, filter); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/messages/${deleteId}`, { method: "DELETE" });
    if (res.ok) { addToast("Message supprimé", "success"); setDeleteId(null); fetchMessages(page, search, filter); }
    else { addToast("Erreur lors de la suppression", "error"); }
    setDeleting(false);
  };

  const tabs = [{ key: "all", label: "Tous" }, { key: "unread", label: "Non lus" }, { key: "read", label: "Lus" }];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} message{total !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72"><SearchInput value={search} onChange={handleSearch} placeholder="Rechercher un message..." /></div>
        <Tabs tabs={tabs} active={filter} onChange={handleFilter} />
      </div>

      {error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={() => fetchMessages(page, search, filter)} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">Réessayer</button>
        </div>
      ) : loading ? <TableSkeleton rows={5} /> : messages.length === 0 ? (
        <EmptyState icon={<MessageSquare size={28} className="text-[var(--admin-text-dim)]" />} title="Aucun message" description={search || filter !== "all" ? "Essayez de modifier vos filtres" : "Les messages de contact apparaîtront ici"} />
      ) : (
        <>
          <div className="admin-card overflow-x-auto rounded-2xl">
            <table className="admin-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Nom</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Contact</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Message</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Intérêt</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Statut</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Date</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{m.name}</td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--admin-text)]">{m.phone}</p>
                      {m.email && <p className="text-xs text-[var(--admin-text-dim)]">{m.email}</p>}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-[var(--admin-text)]">{m.message}</td>
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">{m.activityInterest || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.handled ? "read" : "unread"} /></td>
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">{new Date(m.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setDetailMsg(m); if (!m.handled) markAsRead(m.id); }} className="rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-[var(--admin-text)] transition-colors" title="Voir"><Eye size={15} /></button>
                        {!m.handled && <button onClick={() => markAsRead(m.id)} className="rounded-lg p-1.5 text-[var(--admin-success)] hover:bg-[var(--admin-success)]/10 transition-colors" title="Marquer comme lu"><CheckCircle size={15} /></button>}
                        <button onClick={() => setDeleteId(m.id)} className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors" title="Supprimer"><Trash2 size={15} /></button>
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

      <Modal isOpen={!!detailMsg} onClose={() => setDetailMsg(null)} title="Détails du message">
        {detailMsg && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium text-[var(--admin-text-dim)]">Nom</p><p className="text-sm font-medium text-white">{detailMsg.name}</p></div>
              <div><p className="text-xs font-medium text-[var(--admin-text-dim)]">Téléphone</p><p className="text-sm text-[var(--admin-text)]">{detailMsg.phone}</p></div>
              {detailMsg.email && <div><p className="text-xs font-medium text-[var(--admin-text-dim)]">Email</p><p className="text-sm text-[var(--admin-text)]">{detailMsg.email}</p></div>}
              {detailMsg.activityInterest && <div><p className="text-xs font-medium text-[var(--admin-text-dim)]">Activité intéressée</p><p className="text-sm text-[var(--admin-text)]">{detailMsg.activityInterest}</p></div>}
            </div>
            <div><p className="text-xs font-medium text-[var(--admin-text-dim)]">Message</p><p className="mt-1 whitespace-pre-wrap rounded-lg bg-white/[0.03] p-3 text-sm text-[var(--admin-text)]">{detailMsg.message}</p></div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <p className="text-xs text-[var(--admin-text-dim)]">{new Date(detailMsg.createdAt).toLocaleString("fr-FR")}</p>
              <StatusBadge status={detailMsg.handled ? "read" : "unread"} size="md" />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer le message" message="Cette action est irréversible." loading={deleting} />
    </div>
  );
}
