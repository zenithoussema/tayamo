"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Quote, Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { TableSkeleton } from "@/components/admin/ui/Skeleton";
import Tabs from "@/components/admin/ui/Tabs";
import { useToast } from "@/components/admin/ui/Toast";

interface Testimonial {
  id: number;
  authorName: string;
  content: string;
  rating: number;
  approved: boolean;
  createdAt: string;
}

const emptyForm = { authorName: "", content: "", rating: "5", approved: false };

export default function TestimonialsPage() {
  const { addToast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const prevSearch = useRef("");
  const prevFilter = useRef("all");

  const limit = 10;

  const fetchTestimonials = useCallback(async (p: number, q: string, f: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q) params.set("q", q);
      if (f === "approved") params.set("approved", "true");
      if (f === "pending") params.set("approved", "false");
      const res = await adminFetch(`/api/admin/testimonials?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setTestimonials(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setTestimonials([]);
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
    fetchTestimonials(page, search, filter);
  }, [fetchTestimonials, page, search, filter]);

  const handleSearch = (val: string) => { prevSearch.current = search; setSearch(val); setPage(1); };
  const handleFilter = (val: string) => { prevFilter.current = filter; setFilter(val); setPage(1); };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (t: Testimonial) => {
    setForm({ authorName: t.authorName, content: t.content, rating: String(t.rating), approved: t.approved });
    setEditId(t.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.authorName || !form.content || !form.rating) { addToast("Veuillez remplir tous les champs", "error"); return; }
    setSaving(true);
    const body = { authorName: form.authorName, content: form.content, rating: parseInt(form.rating), approved: form.approved };
    const url = editId ? `/api/admin/testimonials/${editId}` : "/api/admin/testimonials";
    const method = editId ? "PATCH" : "POST";
    const res = await adminFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { addToast(editId ? "Témoignage mis à jour" : "Témoignage ajouté", "success"); setShowForm(false); fetchTestimonials(page, search, filter); }
    else { addToast("Erreur lors de l'enregistrement", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/testimonials/${deleteId}`, { method: "DELETE" });
    if (res.ok) { addToast("Témoignage supprimé", "success"); setDeleteId(null); fetchTestimonials(page, search, filter); }
    else { addToast("Erreur lors de la suppression", "error"); }
    setDeleting(false);
  };

  const toggleApproval = async (t: Testimonial) => {
    const res = await adminFetch(`/api/admin/testimonials/${t.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved: !t.approved }) });
    if (res.ok) { addToast(t.approved ? "Témoignage rejeté" : "Témoignage approuvé", "success"); fetchTestimonials(page, search, filter); }
  };

  const tabs = [{ key: "all", label: "Tous" }, { key: "approved", label: "Approuvés" }, { key: "pending", label: "En attente" }];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Témoignages</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} témoignage{total !== 1 ? "s" : ""} au total</p>
        </div>
        <button onClick={openAdd} className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72"><SearchInput value={search} onChange={handleSearch} placeholder="Rechercher un témoignage..." /></div>
        <Tabs tabs={tabs} active={filter} onChange={handleFilter} />
      </div>

      {error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={() => fetchTestimonials(page, search, filter)} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">Réessayer</button>
        </div>
      ) : loading ? <TableSkeleton rows={5} /> : testimonials.length === 0 ? (
        <EmptyState icon={<Quote size={28} className="text-[var(--admin-text-dim)]" />} title="Aucun témoignage" description="Ajoutez des témoignages de vos clients" action={<button onClick={openAdd} className="admin-btn-gold rounded-xl px-4 py-2 text-sm font-medium">Ajouter un témoignage</button>} />
      ) : (
        <>
          <div className="space-y-4">
            {testimonials.map((t) => (
              <div key={t.id} className={`admin-card rounded-2xl p-5 transition-all ${!t.approved ? "border-l-4 border-[var(--admin-warning)]" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-bold text-white">{t.authorName}</h3>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-sm ${i < t.rating ? "text-[var(--admin-gold)]" : "text-white/10"}`}>★</span>
                        ))}
                      </div>
                      <StatusBadge status={t.approved ? "true" : "false"} />
                    </div>
                    <p className="text-sm text-[var(--admin-text)]">{t.content}</p>
                    <p className="mt-2 text-xs text-[var(--admin-text-dim)]">{new Date(t.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleApproval(t)} className={`rounded-lg p-1.5 transition-colors ${t.approved ? "text-[var(--admin-warning)] hover:bg-[var(--admin-warning)]/10" : "text-[var(--admin-success)] hover:bg-[var(--admin-success)]/10"}`} title={t.approved ? "Rejeter" : "Approuver"}>
                      {t.approved ? <XCircle size={15} /> : <CheckCircle size={15} />}
                    </button>
                    <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-[var(--admin-text)] transition-colors" title="Modifier"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteId(t.id)} className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors" title="Supprimer"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Modifier le témoignage" : "Ajouter un témoignage"}>
        <div className="flex flex-col gap-4">
          <div><label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Nom de l&apos;auteur *</label><input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className="admin-input w-full" /></div>
          <div><label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Témoignage *</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="admin-input w-full" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Note (1-5) *</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="admin-select w-full">
                {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r}/5</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-muted)]">
                <input type="checkbox" checked={form.approved} onChange={(e) => setForm({ ...form, approved: e.target.checked })} className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]" />
                Approuvé
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button onClick={() => setShowForm(false)} className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer"}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer le témoignage" message="Cette action est irréversible." loading={deleting} />
    </div>
  );
}
