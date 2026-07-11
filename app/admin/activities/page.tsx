"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Dumbbell, Plus, Pencil, Trash2 } from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import Modal from "@/components/admin/ui/Modal";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import EmptyState from "@/components/admin/ui/EmptyState";
import { CardSkeleton } from "@/components/admin/ui/Skeleton";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { useToast } from "@/components/admin/ui/Toast";

interface Activity {
  id: number;
  nameFr: string;
  nameAr: string;
  descriptionFr: string | null;
  descriptionAr: string | null;
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  iconName: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { bookings: number; schedules: number };
}

const emptyForm = {
  nameFr: "",
  nameAr: "",
  descriptionFr: "",
  descriptionAr: "",
  ageRangeMin: "",
  ageRangeMax: "",
  iconName: "",
  coverImageUrl: "",
  isActive: true,
};

export default function ActivitiesPage() {
  const { addToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteActivity, setDeleteActivity] = useState<Activity | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const prevSearch = useRef("");

  const limit = 12;

  const fetchActivities = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q) params.set("q", q);
      const res = await adminFetch(`/api/admin/activities?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setActivities(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setActivities([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const changed = prevSearch.current !== search;
    prevSearch.current = search;
    if (changed) {
      setPage(1);
      return;
    }
    fetchActivities(page, search);
  }, [fetchActivities, page, search]);

  const handleSearch = (val: string) => {
    prevSearch.current = search;
    setSearch(val);
    setPage(1);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (a: Activity) => {
    setForm({
      nameFr: a.nameFr,
      nameAr: a.nameAr,
      descriptionFr: a.descriptionFr || "",
      descriptionAr: a.descriptionAr || "",
      ageRangeMin: a.ageRangeMin != null ? String(a.ageRangeMin) : "",
      ageRangeMax: a.ageRangeMax != null ? String(a.ageRangeMax) : "",
      iconName: a.iconName || "",
      coverImageUrl: a.coverImageUrl || "",
      isActive: a.isActive,
    });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nameFr || !form.nameAr) {
      addToast("Les noms français et arabe sont obligatoires", "error");
      return;
    }
    setSaving(true);
    const body: Record<string, string | number | boolean | null | undefined> = {
      nameFr: form.nameFr,
      nameAr: form.nameAr,
      descriptionFr: form.descriptionFr || null,
      descriptionAr: form.descriptionAr || null,
      ageRangeMin: form.ageRangeMin ? Number(form.ageRangeMin) : null,
      ageRangeMax: form.ageRangeMax ? Number(form.ageRangeMax) : null,
      iconName: form.iconName || null,
      coverImageUrl: form.coverImageUrl || null,
      isActive: form.isActive,
    };
    const url = editId ? `/api/admin/activities/${editId}` : "/api/admin/activities";
    const method = editId ? "PATCH" : "POST";
    try {
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        addToast(editId ? "Activité mise à jour" : "Activité ajoutée", "success");
        setShowForm(false);
        fetchActivities(page, search);
      } else {
        addToast("Erreur lors de l'enregistrement", "error");
      }
    } catch {
      addToast("Erreur lors de l'enregistrement", "error");
    }
    setSaving(false);
  };

  const openDelete = (a: Activity) => {
    setDeleteActivity(a);
    setDeleteId(a.id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/activities/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Activité supprimée", "success");
        setDeleteId(null);
        setDeleteActivity(null);
        fetchActivities(page, search);
      } else {
        addToast("Erreur lors de la suppression", "error");
      }
    } catch {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const toggleActive = async (a: Activity) => {
    try {
      const res = await adminFetch(`/api/admin/activities/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !a.isActive }),
      });
      if (res.ok) {
        addToast("Statut mis à jour", "success");
        fetchActivities(page, search);
      }
    } catch {
      addToast("Erreur lors de la mise à jour", "error");
    }
  };

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activités</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} activité{total !== 1 ? "s" : ""} au total</p>
        </div>
        <button onClick={openAdd} className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="w-full sm:w-72">
        <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher une activité..." />
      </div>

      {error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={() => fetchActivities(page, search)} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucune activité"
          description="Ajoutez votre première activité"
          action={
            <button onClick={openAdd} className="admin-btn-gold rounded-xl px-4 py-2 text-sm font-medium">
              Ajouter une activité
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => (
              <div key={a.id} className={`admin-card rounded-2xl p-5 transition-all ${!a.isActive ? "opacity-60" : ""}`}>
                <div className="mb-3 flex items-start gap-4">
                  {a.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.coverImageUrl} alt={a.nameFr} className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-[var(--admin-gold)]">
                      <Dumbbell size={24} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-white">{a.nameFr}</h3>
                    <p className="truncate text-sm text-[var(--admin-gold)]" dir="rtl">{a.nameAr}</p>
                  </div>
                  <StatusBadge status={a.isActive ? "ACTIVE" : "INACTIVE"} />
                </div>

                <div className="mb-3 flex items-center gap-4 text-xs text-[var(--admin-text-muted)]">
                  {a.ageRangeMin != null && a.ageRangeMax != null && (
                    <span>Âge : {a.ageRangeMin}–{a.ageRangeMax} ans</span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex gap-3 text-xs text-[var(--admin-text-dim)]">
                    <span>{a._count?.bookings ?? 0} réservation{(a._count?.bookings ?? 0) !== 1 ? "s" : ""}</span>
                    <span>{a._count?.schedules ?? 0} séance{(a._count?.schedules ?? 0) !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-[var(--admin-text)] transition-colors" title="Modifier">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => toggleActive(a)} className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${a.isActive ? "bg-[var(--admin-warning)]/10 text-[var(--admin-warning)]" : "bg-[var(--admin-success)]/10 text-[var(--admin-success)]"}`}>
                      {a.isActive ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={() => openDelete(a)} className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors" title="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Modifier l'activité" : "Ajouter une activité"}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Nom (FR) *</label>
              <input value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} className="admin-input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Nom (AR) *</label>
              <input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="admin-input w-full" dir="rtl" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Description (FR)</label>
            <textarea value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} rows={3} className="admin-input w-full" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Description (AR)</label>
            <textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={3} className="admin-input w-full" dir="rtl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Âge min</label>
              <input type="number" min={0} value={form.ageRangeMin} onChange={(e) => setForm({ ...form, ageRangeMin: e.target.value })} className="admin-input w-full" placeholder="ex: 4" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Âge max</label>
              <input type="number" min={0} value={form.ageRangeMax} onChange={(e) => setForm({ ...form, ageRangeMax: e.target.value })} className="admin-input w-full" placeholder="ex: 16" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Nom de l&apos;icône</label>
            <input value={form.iconName} onChange={(e) => setForm({ ...form, iconName: e.target.value })} className="admin-input w-full" placeholder="ex: Dumbbell" />
          </div>
          <ImageUploader
            currentUrl={form.coverImageUrl || null}
            onUpload={(url) => setForm({ ...form, coverImageUrl: url })}
            onDelete={() => setForm({ ...form, coverImageUrl: "" })}
            aspectRatio="landscape"
            label="Image de couverture"
          />
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-muted)]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]"
            />
            Actif
          </label>
          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button onClick={() => setShowForm(false)} className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => { setDeleteId(null); setDeleteActivity(null); }}
        onConfirm={handleDelete}
        title="Supprimer l'activité"
        message={
          deleteActivity && (deleteActivity._count?.bookings ?? 0) > 0
            ? `Cette activité a ${deleteActivity._count!.bookings} réservation(s). La suppression dissociera toutes les réservations associées. Voulez-vous continuer ?`
            : "Cette action est irréversible. Voulez-vous vraiment supprimer cette activité ?"
        }
        loading={deleting}
      />
    </div>
  );
}
