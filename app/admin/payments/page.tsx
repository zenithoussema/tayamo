"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  CreditCard,
  Plus,
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
import ExportButton from "@/components/admin/ui/ExportButton";
import Tabs from "@/components/admin/ui/Tabs";
import { useToast } from "@/components/admin/ui/Toast";

interface Payment {
  id: number;
  amount: number;
  method: string;
  reference: string | null;
  description: string | null;
  createdAt: string;
  client?: { id: number; firstName: string; lastName: string; phone: string };
}

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: string }) {
  if (sortBy !== field) return null;
  return sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

const methodLabels: Record<string, string> = {
  CASH: "Espèces",
  CARD: "Carte",
  BANK_TRANSFER: "Virement",
  MOBILE_PAYMENT: "Mobile",
  OTHER: "Autre",
};

export default function PaymentsPage() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [formClientId, setFormClientId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMethod, setFormMethod] = useState("CASH");
  const [formReference, setFormReference] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const prevSearchRef = useRef(search);
  const prevFilterRef = useRef(methodFilter);
  const limit = 10;

  const fetchClients = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/clients?page=1&limit=100");
      if (res.ok) {
        const data = await res.json();
        setClients(data.data || []);
      }
    } catch {}
  }, []);

  useEffect(() => { (async () => { await fetchClients(); })(); }, [fetchClients]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      order: sortOrder,
    });
    if (search) params.set("q", search);
    if (methodFilter !== "all") params.set("method", methodFilter);

    try {
      const res = await adminFetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setPayments(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, methodFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (prevSearchRef.current !== search || prevFilterRef.current !== methodFilter) {
      setPage(1);
      prevSearchRef.current = search;
      prevFilterRef.current = methodFilter;
      return;
    }
    fetchPayments();
  }, [fetchPayments, search, methodFilter]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const resetForm = () => {
    setFormClientId("");
    setFormAmount("");
    setFormMethod("CASH");
    setFormReference("");
    setFormDescription("");
  };

  const handleAdd = async () => {
    if (!formClientId || !formAmount || Number(formAmount) <= 0) {
      addToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: Number(formClientId),
          amount: Number(formAmount),
          method: formMethod,
          reference: formReference || undefined,
          description: formDescription || undefined,
        }),
      });
      if (res.ok) {
        addToast("Paiement ajouté avec succès", "success");
        setShowAdd(false);
        resetForm();
        fetchPayments();
      } else {
        addToast("Erreur lors de l'ajout du paiement", "error");
      }
    } catch {
      addToast("Erreur de connexion", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/payments/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("Paiement supprimé", "success");
      setDeleteId(null);
      fetchPayments();
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const methodTabs = [
    { key: "all", label: "Tous" },
    { key: "CASH", label: "Espèces" },
    { key: "CARD", label: "Carte" },
    { key: "BANK_TRANSFER", label: "Virement" },
    { key: "MOBILE_PAYMENT", label: "Mobile" },
  ];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Paiements</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} paiement{total !== 1 ? "s" : ""} au total</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton endpoint="/api/admin/export?type=payments" filename="paiements.csv" label="Exporter CSV" />
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="admin-btn-gold flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Ajouter un paiement
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un client..." />
        </div>
        <Tabs tabs={methodTabs} active={methodFilter} onChange={setMethodFilter} />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={fetchPayments} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">
            Réessayer
          </button>
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucun paiement"
          description={search || methodFilter !== "all" ? "Essayez de modifier vos filtres" : "Les paiements apparaîtront ici"}
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
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Client</th>
                  <th className="cursor-pointer px-4 py-3 font-medium text-[var(--admin-text-muted)] hover:text-white transition-colors" onClick={() => handleSort("amount")}>
                    <span className="flex items-center gap-1">Montant <SortIcon field="amount" sortBy={sortBy} sortOrder={sortOrder} /></span>
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Méthode</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Référence</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                      {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {p.client ? (
                        <div>
                          <p className="font-medium text-white">{p.client.firstName} {p.client.lastName}</p>
                          <p className="text-xs text-[var(--admin-text-muted)]">{p.client.phone}</p>
                        </div>
                      ) : (
                        <span className="text-[var(--admin-text-dim)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--admin-gold)]">{p.amount.toFixed(2)} TND</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-[var(--admin-text)]">
                        {methodLabels[p.method] || p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">{p.reference || "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteId(p.id)} className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors" title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Ajouter un paiement">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-text-muted)]">Client *</label>
            <select value={formClientId} onChange={(e) => setFormClientId(e.target.value)} className="admin-select w-full rounded-lg px-3 py-2.5 text-sm text-white">
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-text-muted)]">Montant (TND) *</label>
            <input type="number" step="0.01" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} className="admin-input w-full rounded-lg px-3 py-2.5 text-sm text-white" placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-text-muted)]">Méthode</label>
            <select value={formMethod} onChange={(e) => setFormMethod(e.target.value)} className="admin-select w-full rounded-lg px-3 py-2.5 text-sm text-white">
              <option value="CASH">Espèces</option>
              <option value="CARD">Carte</option>
              <option value="BANK_TRANSFER">Virement bancaire</option>
              <option value="MOBILE_PAYMENT">Paiement mobile</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-text-muted)]">Référence</label>
            <input type="text" value={formReference} onChange={(e) => setFormReference(e.target.value)} className="admin-input w-full rounded-lg px-3 py-2.5 text-sm text-white" placeholder="Numéro de référence" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--admin-text-muted)]">Description</label>
            <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="admin-input w-full rounded-lg px-3 py-2.5 text-sm text-white" rows={3} placeholder="Notes supplémentaires..." />
          </div>
          <div className="flex gap-3 border-t border-white/5 pt-4">
            <button onClick={() => setShowAdd(false)} className="admin-btn-ghost flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors">
              Annuler
            </button>
            <button onClick={handleAdd} disabled={submitting} className="admin-btn-gold flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
              {submitting ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le paiement"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce paiement ?"
        loading={deleting}
      />
    </div>
  );
}
