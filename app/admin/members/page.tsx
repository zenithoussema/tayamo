"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Users, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { TableSkeleton } from "@/components/admin/ui/Skeleton";
import ExportButton from "@/components/admin/ui/ExportButton";
import Tabs from "@/components/admin/ui/Tabs";
import { useToast } from "@/components/admin/ui/Toast";
import { ACTIVITIES } from "@/lib/activities";

interface Member {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  dateOfBirth: string | null;
  activity: string;
  category: string | null;
  profileImageUrl: string | null;
  planId: number | null;
  assignedCoachId: number | null;
  subscriptionStartDate: string;
  subscriptionDurationDays: number;
  pricePaid: number;
  notes: string | null;
  createdAt: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
}

interface Coach {
  id: number;
  fullName: string;
}

function getMemberStatus(m: Member) {
  const start = new Date(m.subscriptionStartDate);
  const end = new Date(start.getTime() + m.subscriptionDurationDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring";
  return "active";
}

function getDaysLeft(m: Member) {
  const start = new Date(m.subscriptionStartDate);
  const end = new Date(start.getTime() + m.subscriptionDurationDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  dateOfBirth: "",
  activity: "",
  category: "",
  planId: "",
  assignedCoachId: "",
  subscriptionStartDate: "",
  subscriptionDurationDays: "30",
  pricePaid: "",
  notes: "",
};

export default function MembersPage() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const limit = 10;

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    adminFetch("/api/admin/subscription-plans?page=1&limit=100")
      .then((r) => r.json())
      .then((d) => setPlans(d.data || d || []))
      .catch(() => {});
    adminFetch("/api/admin/coaches?page=1&limit=100")
      .then((r) => r.json())
      .then((d) => setCoaches(d.data || d || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set("q", search);
        if (activityFilter) params.set("activity", activityFilter);
        if (planFilter) params.set("planId", planFilter);
        if (dateFrom) params.set("from", dateFrom);
        if (dateTo) params.set("to", dateTo);
        const res = await adminFetch(`/api/admin/clients?${params}`);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setMembers(data.data || []);
          setTotal(data.total || 0);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur de chargement");
          setMembers([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, search, activityFilter, planFilter, dateFrom, dateTo, refreshKey]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilter = (val: string) => {
    setFilter(val);
    setPage(1);
  };

  const filteredMembers =
    filter === "all"
      ? members
      : members.filter((m) => getMemberStatus(m) === filter);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (m: Member) => {
    setForm({
      fullName: m.fullName,
      phone: m.phone,
      email: m.email || "",
      dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split("T")[0] : "",
      activity: m.activity,
      category: m.category || "",
      planId: m.planId ? String(m.planId) : "",
      assignedCoachId: m.assignedCoachId ? String(m.assignedCoachId) : "",
      subscriptionStartDate: m.subscriptionStartDate.split("T")[0],
      subscriptionDurationDays: String(m.subscriptionDurationDays),
      pricePaid: String(m.pricePaid),
      notes: m.notes || "",
    });
    setEditId(m.id);
    setShowForm(true);
  };

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === Number(planId));
    if (plan) {
      setForm((prev) => ({
        ...prev,
        planId,
        pricePaid: String(plan.price),
        subscriptionDurationDays: String(plan.durationDays),
      }));
    } else {
      setForm((prev) => ({ ...prev, planId }));
    }
  };

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.activity || !form.pricePaid) {
      addToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }
    setSaving(true);
    const body: Record<string, string | number | boolean | null | undefined> = {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email || null,
      dateOfBirth: form.dateOfBirth || null,
      activity: form.activity,
      category: form.category || null,
      planId: form.planId ? Number(form.planId) : null,
      assignedCoachId: form.assignedCoachId ? Number(form.assignedCoachId) : null,
      subscriptionStartDate: form.subscriptionStartDate || undefined,
      subscriptionDurationDays: parseInt(form.subscriptionDurationDays) || 30,
      pricePaid: parseFloat(form.pricePaid),
      notes: form.notes || null,
    };

    const url = editId ? `/api/admin/clients/${editId}` : "/api/admin/clients";
    const method = editId ? "PATCH" : "POST";
    const res = await adminFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      addToast(editId ? "Membre mis à jour" : "Membre ajouté", "success");
      setShowForm(false);
      refresh();
    } else {
      addToast("Erreur lors de l'enregistrement", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/clients/${deleteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      addToast("Membre supprimé", "success");
      setDeleteId(null);
      refresh();
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const handleRenew = async (m: Member) => {
    const res = await adminFetch(`/api/admin/clients/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriptionStartDate: new Date().toISOString().split("T")[0],
      }),
    });
    if (res.ok) {
      addToast("Abonnement renouvelé", "success");
      refresh();
    }
  };

  const statusTabs = [
    { key: "all", label: "Tous" },
    { key: "active", label: "Actifs" },
    { key: "expiring", label: "Expire bientôt" },
    { key: "expired", label: "Expirés" },
  ];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Membres</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            {total} membre{total !== 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton endpoint="/api/admin/export?type=members" filename="membres.csv" label="Exporter CSV" />
          <button
            onClick={openAdd}
            className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Rechercher un membre..."
          />
        </div>
        <Tabs tabs={statusTabs} active={filter} onChange={handleFilter} />
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={activityFilter}
          onChange={(e) => { setActivityFilter(e.target.value); setPage(1); }}
          className="admin-select w-auto min-w-[160px]"
        >
          <option value="">Toutes les activités</option>
          {ACTIVITIES.map((a) => (
            <option key={a.slug} value={a.nameFr}>{a.nameFr}</option>
          ))}
        </select>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="admin-select w-auto min-w-[160px]"
        >
          <option value="">All Plans</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          placeholder="From"
          className="admin-input w-auto"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          placeholder="To"
          className="admin-input w-auto"
        />
        {(activityFilter || planFilter || dateFrom || dateTo) && (
          <button
            onClick={() => { setActivityFilter(""); setPlanFilter(""); setDateFrom(""); setDateTo(""); setPage(1); }}
            className="admin-btn-ghost rounded-lg px-3 py-2 text-xs font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button
            onClick={() => refresh()}
            className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <TableSkeleton rows={8} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Users size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucun membre"
          description={
            search || filter !== "all"
              ? "Essayez de modifier vos filtres"
              : "Ajoutez votre premier membre"
          }
          action={
            <button
              onClick={openAdd}
              className="admin-btn-gold rounded-xl px-4 py-2 text-sm font-medium"
            >
              Ajouter un membre
            </button>
          }
        />
      ) : (
        <>
          <div className="admin-card overflow-x-auto rounded-2xl">
            <table className="admin-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">
                    Nom
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">
                    Téléphone
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">
                    Activité
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">
                    Statut
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">
                    Fin abonnement
                  </th>
                  <th className="px-4 py-3 font-medium text-[var(--admin-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => {
                  const status = getMemberStatus(m);
                  const daysLeft = getDaysLeft(m);
                  const endDate = new Date(
                    new Date(m.subscriptionStartDate).getTime() +
                      m.subscriptionDurationDays * 24 * 60 * 60 * 1000
                  );
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {m.profileImageUrl ? (
                            <img
                              src={m.profileImageUrl}
                              alt={m.fullName}
                              className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4a843]/10 text-xs font-bold text-[#d4a843]">
                              {m.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{m.fullName}</p>
                            {m.email && (
                              <p className="text-xs text-[var(--admin-text-dim)]">
                                {m.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--admin-text)]">{m.phone}</td>
                      <td className="px-4 py-3 text-[var(--admin-text)]">
                        {m.activity}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                        {endDate.toLocaleDateString("fr-FR")}
                        {status !== "expired" && (
                          <span className="ml-1 text-[var(--admin-text-dim)]">
                            ({daysLeft}j)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(m)}
                            className="rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-[var(--admin-text)] transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleRenew(m)}
                            className="rounded-lg p-1.5 text-[var(--admin-success)] hover:bg-[var(--admin-success)]/10 transition-colors"
                            title="Renouveler"
                          >
                            <RefreshCw size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteId(m.id)}
                            className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? "Modifier le membre" : "Ajouter un membre"}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
              Nom complet *
            </label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="admin-input w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Téléphone *
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="admin-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Date de naissance
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="admin-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Activité *
              </label>
              <select
                value={form.activity}
                onChange={(e) => setForm({ ...form, activity: e.target.value })}
                className="admin-select w-full"
              >
                <option value="">— Sélectionner —</option>
                {ACTIVITIES.map((a) => (
                  <option key={a.slug} value={a.nameFr}>
                    {a.nameFr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Abonnement
              </label>
              <select
                value={form.planId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="admin-select w-full"
              >
                <option value="">— Personnalisé —</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.price} TND ({p.durationDays}j)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Entraîneur assigné
              </label>
              <select
                value={form.assignedCoachId}
                onChange={(e) =>
                  setForm({ ...form, assignedCoachId: e.target.value })
                }
                className="admin-select w-full"
              >
                <option value="">— Aucun —</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Date de début
              </label>
              <input
                type="date"
                value={form.subscriptionStartDate}
                onChange={(e) =>
                  setForm({ ...form, subscriptionStartDate: e.target.value })
                }
                className="admin-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Durée (jours)
              </label>
              <select
                value={form.subscriptionDurationDays}
                onChange={(e) =>
                  setForm({ ...form, subscriptionDurationDays: e.target.value })
                }
                className="admin-select w-full"
              >
                <option value="30">30 jours</option>
                <option value="90">90 jours</option>
                <option value="180">180 jours</option>
                <option value="365">365 jours</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Prix payé (TND) *
              </label>
              <input
                type="number"
                step="0.01"
                value={form.pricePaid}
                onChange={(e) => setForm({ ...form, pricePaid: e.target.value })}
                className="admin-input w-full"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="admin-input w-full"
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button
              onClick={() => setShowForm(false)}
              className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce membre ?"
        loading={deleting}
      />
    </div>
  );
}
