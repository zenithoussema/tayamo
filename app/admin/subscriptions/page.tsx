"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { CardSkeleton } from "@/components/admin/ui/Skeleton";
import { useToast } from "@/components/admin/ui/Toast";

interface Plan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  features: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = { name: "", price: "", durationDays: "30", features: "", isActive: true };

export default function SubscriptionsPage() {
  const { addToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const prevSearch = useRef("");

  const limit = 20;

  const fetchPlans = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q) params.set("q", q);
      const res = await adminFetch(`/api/admin/subscription-plans?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setPlans(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setPlans([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const changed = prevSearch.current !== search;
    prevSearch.current = search;
    if (changed) { setPage(1); return; }
    fetchPlans(page, search);
  }, [fetchPlans, page, search]);

  const handleSearch = (val: string) => { prevSearch.current = search; setSearch(val); setPage(1); };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (p: Plan) => {
    let featuresStr = "";
    try { featuresStr = JSON.parse(p.features).join("\n"); } catch { featuresStr = p.features; }
    setForm({ name: p.name, price: String(p.price), durationDays: String(p.durationDays), features: featuresStr, isActive: p.isActive });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.durationDays) { addToast("Veuillez remplir tous les champs obligatoires", "error"); return; }
    setSaving(true);
    const features = form.features.split("\n").filter((f) => f.trim());
    const body = { name: form.name, price: parseFloat(form.price), durationDays: parseInt(form.durationDays), features, isActive: form.isActive };
    const url = editId ? `/api/admin/subscription-plans/${editId}` : "/api/admin/subscription-plans";
    const method = editId ? "PATCH" : "POST";
    const res = await adminFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { addToast(editId ? "Plan mis à jour" : "Plan ajouté", "success"); setShowForm(false); fetchPlans(page, search); }
    else { addToast("Erreur lors de l'enregistrement", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/subscription-plans/${deleteId}`, { method: "DELETE" });
    if (res.ok) { addToast("Plan supprimé", "success"); setDeleteId(null); fetchPlans(page, search); }
    else { addToast("Erreur lors de la suppression", "error"); }
    setDeleting(false);
  };

  const toggleActive = async (p: Plan) => {
    const res = await adminFetch(`/api/admin/subscription-plans/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) });
    if (res.ok) { addToast("Statut mis à jour", "success"); fetchPlans(page, search); }
  };

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Abonnements</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} plan{total !== 1 ? "s" : ""} au total</p>
        </div>
        <button onClick={openAdd} className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="w-full sm:w-72"><SearchInput value={search} onChange={handleSearch} placeholder="Rechercher un plan..." /></div>

      {error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={() => fetchPlans(page, search)} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">Réessayer</button>
        </div>
      ) : loading ? <CardSkeleton count={4} /> : plans.length === 0 ? (
        <EmptyState icon={<CreditCard size={28} className="text-[var(--admin-text-dim)]" />} title="Aucun plan d'abonnement" description="Créez votre premier plan" action={<button onClick={openAdd} className="admin-btn-gold rounded-xl px-4 py-2 text-sm font-medium">Ajouter un plan</button>} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => {
              let features: string[] = [];
              try { features = JSON.parse(p.features); } catch { features = []; }
              return (
                <div key={p.id} className={`admin-card rounded-2xl p-5 transition-all ${!p.isActive ? "opacity-60" : ""}`}>
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{p.name}</h3>
                      <p className="text-2xl font-extrabold text-[var(--admin-gold)]">{p.price} <span className="text-sm font-normal text-[var(--admin-text-muted)]">TND</span></p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? "bg-[var(--admin-success)]/10 text-[var(--admin-success)]" : "bg-white/5 text-[var(--admin-text-dim)]"}`}>
                      {p.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-[var(--admin-text-muted)]">{p.durationDays} jours</p>
                  {features.length > 0 && (
                    <ul className="mb-4 space-y-1.5">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--admin-text)]">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--admin-gold)]" />{f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2 border-t border-white/5 pt-3">
                    <button onClick={() => openEdit(p)} className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-white/10 transition-colors"><Pencil size={12} /> Modifier</button>
                    <button onClick={() => toggleActive(p)} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${p.isActive ? "bg-[var(--admin-warning)]/10 text-[var(--admin-warning)] hover:bg-[var(--admin-warning)]/20" : "bg-[var(--admin-success)]/10 text-[var(--admin-success)] hover:bg-[var(--admin-success)]/20"}`}>
                      {p.isActive ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="flex items-center gap-1 rounded-lg bg-[var(--admin-danger)]/10 px-3 py-1.5 text-xs font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors"><Trash2 size={12} /> Supprimer</button>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Modifier le plan" : "Ajouter un plan"}>
        <div className="flex flex-col gap-4">
          <div><label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Nom du plan *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Plan Mensuel" className="admin-input w-full" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Prix (TND) *</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="admin-input w-full" /></div>
            <div><label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Durée (jours) *</label><input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} className="admin-input w-full" /></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Avantages (un par ligne)</label><textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} placeholder={"Accès à la salle\nCours collectifs\nCoach personnel"} className="admin-input w-full" /></div>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-muted)]">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]" />
            Plan actif
          </label>
          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button onClick={() => setShowForm(false)} className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer"}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer le plan" message="Cette action est irréversible." loading={deleting} />
    </div>
  );
}
