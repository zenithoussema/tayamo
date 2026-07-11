"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Clock, Plus, Pencil, Trash2, Power } from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import Modal from "@/components/admin/ui/Modal";
import EmptyState from "@/components/admin/ui/EmptyState";
import { TableSkeleton } from "@/components/admin/ui/Skeleton";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Tabs from "@/components/admin/ui/Tabs";
import { useToast } from "@/components/admin/ui/Toast";

const DAY_OPTIONS = [
  { value: "MONDAY", label: "Lundi" },
  { value: "TUESDAY", label: "Mardi" },
  { value: "WEDNESDAY", label: "Mercredi" },
  { value: "THURSDAY", label: "Jeudi" },
  { value: "FRIDAY", label: "Vendredi" },
  { value: "SATURDAY", label: "Samedi" },
  { value: "SUNDAY", label: "Dimanche" },
];

const CATEGORY_OPTIONS = [
  { value: "KIDS", label: "Enfants" },
  { value: "ADULTS", label: "Adultes" },
  { value: "WOMEN", label: "Femmes" },
];

const SEASON_OPTIONS = [
  { value: "SUMMER", label: "Été" },
  { value: "WINTER", label: "Hiver" },
];

const dayLabels: Record<string, string> = Object.fromEntries(DAY_OPTIONS.map((d) => [d.value, d.label]));
const categoryLabels: Record<string, string> = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c.value, c.label]));
const categoryColors: Record<string, string> = {
  KIDS: "bg-blue-500/10 text-blue-400",
  ADULTS: "bg-emerald-500/10 text-emerald-400",
  WOMEN: "bg-pink-500/10 text-pink-400",
};

interface Schedule {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  coachName: string;
  category: string;
  season: string;
  isActive: boolean;
  activity: { id: number; nameFr: string };
  coach: { id: number; name: string } | null;
}

interface ActivityOption {
  id: number;
  nameFr: string;
}

interface CoachOption {
  id: number;
  name: string;
}

const emptyForm = {
  activityId: "",
  coachId: "",
  dayOfWeek: "MONDAY",
  startTime: "",
  endTime: "",
  coachName: "",
  category: "ADULTS",
  season: "SUMMER",
};

export default function SchedulesPage() {
  const { addToast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const prevSearch = useRef("");
  const prevDay = useRef(dayFilter);
  const prevActivity = useRef(activityFilter);
  const prevCategory = useRef(categoryFilter);
  const prevSeason = useRef(seasonFilter);

  const limit = 15;

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("q", search);
      if (dayFilter !== "all") params.set("dayOfWeek", dayFilter);
      if (activityFilter !== "all") params.set("activityId", activityFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (seasonFilter !== "all") params.set("season", seasonFilter);
      const res = await adminFetch(`/api/admin/schedules?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setSchedules(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setSchedules([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, dayFilter, activityFilter, categoryFilter, seasonFilter]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [actRes, coachRes] = await Promise.all([
        adminFetch("/api/admin/activities?limit=200"),
        adminFetch("/api/admin/coaches?page=1&limit=100"),
      ]);
      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities((actData.data || []).map((a: { id: number; nameFr: string }) => ({ id: a.id, nameFr: a.nameFr })));
      }
      if (coachRes.ok) {
        const coachData = await coachRes.json();
        setCoaches((coachData.data || []).map((c: { id: number; name: string }) => ({ id: c.id, name: c.name })));
      }
    } catch {
      // silent fail for dropdowns
    }
  }, []);

  useEffect(() => {
    (async () => { await fetchDropdowns(); })();
  }, [fetchDropdowns]);

  useEffect(() => {
    const searchChanged = prevSearch.current !== search;
    const dayChanged = prevDay.current !== dayFilter;
    const actChanged = prevActivity.current !== activityFilter;
    const catChanged = prevCategory.current !== categoryFilter;
    const seaChanged = prevSeason.current !== seasonFilter;
    prevSearch.current = search;
    prevDay.current = dayFilter;
    prevActivity.current = activityFilter;
    prevCategory.current = categoryFilter;
    prevSeason.current = seasonFilter;
    if (searchChanged || dayChanged || actChanged || catChanged || seaChanged) {
      setPage(1);
      return;
    }
    fetchSchedules();
  }, [fetchSchedules, search, dayFilter, activityFilter, categoryFilter, seasonFilter]);

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

  const openEdit = (s: Schedule) => {
    setForm({
      activityId: String(s.activity.id),
      coachId: s.coach ? String(s.coach.id) : "",
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime.slice(0, 5),
      endTime: s.endTime.slice(0, 5),
      coachName: s.coachName,
      category: s.category,
      season: s.season,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.activityId || !form.startTime || !form.endTime) {
      addToast("L'activité, l'heure de début et de fin sont obligatoires", "error");
      return;
    }
    setSaving(true);
    const body: Record<string, string | number | boolean | null | undefined> = {
      activityId: Number(form.activityId),
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      coachName: form.coachName || null,
      category: form.category,
      season: form.season,
    };
    if (form.coachId) body.coachId = Number(form.coachId);
    const url = editId ? `/api/admin/schedules/${editId}` : "/api/admin/schedules";
    const method = editId ? "PATCH" : "POST";
    try {
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        addToast(editId ? "Séance mise à jour" : "Séance ajoutée", "success");
        setShowForm(false);
        fetchSchedules();
      } else {
        addToast("Erreur lors de l'enregistrement", "error");
      }
    } catch {
      addToast("Erreur lors de l'enregistrement", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/schedules/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Séance supprimée", "success");
        setDeleteId(null);
        fetchSchedules();
      } else {
        addToast("Erreur lors de la suppression", "error");
      }
    } catch {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const handleToggleActive = async (schedule: Schedule) => {
    try {
      const res = await adminFetch(`/api/admin/schedules/${schedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !schedule.isActive }),
      });
      if (res.ok) {
        addToast(schedule.isActive ? "Séance désactivée" : "Séance activée", "success");
        fetchSchedules();
      } else {
        addToast("Erreur lors de la mise à jour", "error");
      }
    } catch {
      addToast("Erreur lors de la mise à jour", "error");
    }
  };

  const dayTabs = [
    { key: "all", label: "Tous" },
    ...DAY_OPTIONS.map((d) => ({ key: d.value, label: d.label })),
  ];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Planning</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">{total} séance{total !== 1 ? "s" : ""} au total</p>
        </div>
        <button onClick={openAdd} className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher par coach ou activité..." />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={activityFilter} onChange={(e) => { setActivityFilter(e.target.value); setPage(1); }} className="admin-select w-full sm:w-48">
            <option value="all">Toutes les activités</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>{a.nameFr}</option>
            ))}
          </select>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="admin-select w-full sm:w-40">
            <option value="all">Toutes les catégories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select value={seasonFilter} onChange={(e) => { setSeasonFilter(e.target.value); setPage(1); }} className="admin-select w-full sm:w-36">
            <option value="all">Toutes saisons</option>
            {SEASON_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Tabs tabs={dayTabs} active={dayFilter} onChange={setDayFilter} />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button onClick={fetchSchedules} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">
            Réessayer
          </button>
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={<Clock size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucune séance"
          description={search || dayFilter !== "all" || activityFilter !== "all" || categoryFilter !== "all" || seasonFilter !== "all" ? "Essayez de modifier vos filtres" : "Ajoutez votre première séance"}
          action={
            <button onClick={openAdd} className="admin-btn-gold rounded-xl px-4 py-2 text-sm font-medium">
              Ajouter une séance
            </button>
          }
        />
      ) : (
        <>
          <div className="admin-card overflow-x-auto rounded-2xl">
            <table className="admin-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Jour</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Activité</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Catégorie</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Horaires</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Coach</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Saison</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Statut</th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-lg bg-[var(--admin-gold)]/10 px-2.5 py-1 text-xs font-medium text-[var(--admin-gold)]">
                        {dayLabels[s.dayOfWeek] || s.dayOfWeek}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--admin-text)]">{s.activity.nameFr}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-medium ${categoryColors[s.category] || "bg-white/5 text-[var(--admin-text-muted)]"}`}>
                        {categoryLabels[s.category] || s.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-[var(--admin-text)]">
                      {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-[var(--admin-text-muted)]">{s.coachName || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-[var(--admin-text-muted)]">
                        {s.season === "SUMMER" ? "☀️ Été" : "❄️ Hiver"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                          s.isActive
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        }`}
                      >
                        <Power size={12} />
                        {s.isActive ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-[var(--admin-text)] transition-colors" title="Modifier">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors" title="Supprimer">
                          <Trash2 size={14} />
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

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Modifier la séance" : "Ajouter une séance"}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Activité *</label>
            <select value={form.activityId} onChange={(e) => setForm({ ...form, activityId: e.target.value })} className="admin-select w-full">
              <option value="">Sélectionner une activité</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>{a.nameFr}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Catégorie *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="admin-select w-full">
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Saison *</label>
              <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="admin-select w-full">
                {SEASON_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Coach</label>
            <select value={form.coachId} onChange={(e) => {
              const selected = coaches.find((c) => c.id === Number(e.target.value));
              setForm({ ...form, coachId: e.target.value, coachName: selected?.name || "" });
            }} className="admin-select w-full">
              <option value="">Sélectionner un coach</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Jour *</label>
            <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })} className="admin-select w-full">
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Heure de début *</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="admin-input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Heure de fin *</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="admin-input w-full" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Nom du coach (affichage)</label>
            <input value={form.coachName} onChange={(e) => setForm({ ...form, coachName: e.target.value })} className="admin-input w-full" placeholder="Optionnel si coach sélectionné" />
          </div>
          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button onClick={() => setShowForm(false)} className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Supprimer la séance" message="Cette action est irréversible. Voulez-vous vraiment supprimer cette séance ?" loading={deleting} />
    </div>
  );
}
