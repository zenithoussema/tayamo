"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  UserCheck,
  Plus,
  Pencil,
  Trash2,
  Award,
  Calendar,
  ExternalLink,
  Globe,
} from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { CardSkeleton } from "@/components/admin/ui/Skeleton";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import Tabs from "@/components/admin/ui/Tabs";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { useToast } from "@/components/admin/ui/Toast";

interface CoachSocial {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

interface Coach {
  id: number;
  name: string;
  specialty: string;
  imageUrl: string | null;
  bio: string;
  experience: number;
  certifications: string;
  social: CoachSocial;
  isActive: boolean;
  createdAt: string;
  _count?: { schedules: number };
}

interface CoachForm {
  name: string;
  specialty: string;
  imageUrl: string;
  bio: string;
  experience: number;
  certifications: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  isActive: boolean;
}

const emptyForm: CoachForm = {
  name: "",
  specialty: "",
  imageUrl: "",
  bio: "",
  experience: 0,
  certifications: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  isActive: true,
};

const SOCIAL_TABS = [
  { key: "info", label: "Informations" },
  { key: "details", label: "Détails" },
  { key: "social", label: "Réseaux sociaux" },
];

export default function CoachesPage() {
  const { addToast } = useToast();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CoachForm>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formTab, setFormTab] = useState("info");
  const prevSearch = useRef("");

  const limit = 12;

  const fetchCoaches = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q) params.set("q", q);
      const res = await adminFetch(`/api/admin/coaches?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setCoaches(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setCoaches([]);
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
    fetchCoaches(page, search);
  }, [fetchCoaches, page, search]);

  const handleSearch = (val: string) => {
    prevSearch.current = search;
    setSearch(val);
    setPage(1);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setFormTab("info");
    setShowForm(true);
  };

  const openEdit = (c: Coach) => {
    setForm({
      name: c.name,
      specialty: c.specialty,
      imageUrl: c.imageUrl || "",
      bio: c.bio || "",
      experience: c.experience || 0,
      certifications: c.certifications || "",
      facebook: c.social?.facebook || "",
      instagram: c.social?.instagram || "",
      tiktok: c.social?.tiktok || "",
      isActive: c.isActive,
    });
    setEditId(c.id);
    setFormTab("info");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.specialty) {
      addToast("Nom et spécialité sont obligatoires", "error");
      return;
    }
    setSaving(true);
    const body = {
      name: form.name,
      specialty: form.specialty,
      imageUrl: form.imageUrl || null,
      bio: form.bio,
      experience: form.experience,
      certifications: form.certifications,
      social: {
        facebook: form.facebook || undefined,
        instagram: form.instagram || undefined,
        tiktok: form.tiktok || undefined,
      },
      isActive: form.isActive,
    };
    const url = editId ? `/api/admin/coaches/${editId}` : "/api/admin/coaches";
    const method = editId ? "PATCH" : "POST";
    const res = await adminFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      addToast(editId ? "Entraîneur mis à jour" : "Entraîneur ajouté", "success");
      setShowForm(false);
      fetchCoaches(page, search);
    } else {
      addToast("Erreur lors de l'enregistrement", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/coaches/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("Entraîneur supprimé", "success");
      setDeleteId(null);
      fetchCoaches(page, search);
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const toggleActive = async (c: Coach) => {
    const res = await adminFetch(`/api/admin/coaches/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    if (res.ok) {
      addToast("Statut mis à jour", "success");
      fetchCoaches(page, search);
    }
  };

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Entraîneurs</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            {total} entraîneur{total !== 1 ? "s" : ""} au total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="w-full sm:w-72">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Rechercher un entraîneur..."
        />
      </div>

      {error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button
            onClick={() => fetchCoaches(page, search)}
            className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : coaches.length === 0 ? (
        <EmptyState
          icon={<UserCheck size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucun entraîneur"
          description="Ajoutez votre premier entraîneur"
          action={
            <button
              onClick={openAdd}
              className="admin-btn-gold rounded-xl px-4 py-2 text-sm font-medium"
            >
              Ajouter un entraîneur
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((c) => (
              <div
                key={c.id}
                className={`admin-card rounded-2xl overflow-hidden transition-all ${!c.isActive ? "opacity-60" : ""}`}
              >
                <div className="relative">
                  {c.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-white/5 text-4xl font-bold text-[var(--admin-text-dim)]">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <StatusBadge
                      status={c.isActive ? "active" : "expired"}
                      size="md"
                    />
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-white">{c.name}</h3>
                    <p className="text-sm text-[var(--admin-gold)]">{c.specialty}</p>
                  </div>

                  {c.experience > 0 && (
                    <div className="mb-3 flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
                      <Calendar size={14} className="text-[var(--admin-gold)]" />
                      <span>
                        {c.experience} an{c.experience > 1 ? "s" : ""} d&apos;expérience
                      </span>
                    </div>
                  )}

                  {c.certifications && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        {c.certifications
                          .split(",")
                          .map((cert) => cert.trim())
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((cert, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full bg-[var(--admin-gold)]/10 px-2 py-0.5 text-xs text-[var(--admin-gold)]"
                            >
                              <Award size={10} />
                              {cert}
                            </span>
                          ))}
                        {c.certifications.split(",").length > 3 && (
                          <span className="text-xs text-[var(--admin-text-dim)]">
                            +{c.certifications.split(",").length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {c.bio && (
                    <p className="mb-3 line-clamp-2 text-sm text-[var(--admin-text-muted)]">
                      {c.bio}
                    </p>
                  )}

                  {(c.social?.facebook || c.social?.instagram || c.social?.tiktok) && (
                    <div className="mb-3 flex items-center gap-2">
                      {c.social?.facebook && (
                        <a
                          href={c.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-white/5 p-1.5 text-[var(--admin-text-dim)] hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors"
                          title="Facebook"
                        >
                          <Globe size={14} />
                        </a>
                      )}
                      {c.social?.instagram && (
                        <a
                          href={c.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-white/5 p-1.5 text-[var(--admin-text-dim)] hover:bg-[#E4405F]/10 hover:text-[#E4405F] transition-colors"
                          title="Instagram"
                        >
                          <Globe size={14} />
                        </a>
                      )}
                      {c.social?.tiktok && (
                        <a
                          href={c.social.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-white/5 p-1.5 text-[var(--admin-text-dim)] hover:bg-white/10 hover:text-white transition-colors"
                          title="TikTok"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-xs text-[var(--admin-text-dim)]">
                      {c._count?.schedules ?? 0} séance
                      {c._count?.schedules !== 1 ? "s" : ""}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-lg p-1.5 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-[var(--admin-text)] transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => toggleActive(c)}
                        className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                          c.isActive
                            ? "bg-[var(--admin-warning)]/10 text-[var(--admin-warning)]"
                            : "bg-[var(--admin-success)]/10 text-[var(--admin-success)]"
                        }`}
                      >
                        {c.isActive ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="rounded-lg p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? "Modifier l'entraîneur" : "Ajouter un entraîneur"}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-4">
          <Tabs tabs={SOCIAL_TABS} active={formTab} onChange={setFormTab} />

          {formTab === "info" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                    Nom *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                    Spécialité *
                  </label>
                  <input
                    value={form.specialty}
                    onChange={(e) =>
                      setForm({ ...form, specialty: e.target.value })
                    }
                    className="admin-input w-full"
                  />
                </div>
              </div>
              <ImageUploader
                currentUrl={form.imageUrl || null}
                onUpload={(url) => setForm({ ...form, imageUrl: url })}
                onDelete={() => setForm({ ...form, imageUrl: "" })}
                aspectRatio="square"
                label="Photo de l'entraîneur"
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="admin-input w-full"
                  placeholder="Biographie de l'entraîneur..."
                />
                <p className="mt-1 text-xs text-[var(--admin-text-dim)]">
                  {form.bio.length} caractère{form.bio.length !== 1 ? "s" : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text-muted)]">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]"
                />
                Actif
              </label>
            </div>
          )}

          {formTab === "details" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                  Années d&apos;expérience
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={form.experience}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      experience: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="admin-input w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                  Certifications
                </label>
                <textarea
                  value={form.certifications}
                  onChange={(e) =>
                    setForm({ ...form, certifications: e.target.value })
                  }
                  rows={3}
                  className="admin-input w-full"
                  placeholder="Certifications séparées par des virgules..."
                />
                <p className="mt-1 text-xs text-[var(--admin-text-dim)]">
                  Séparez chaque certification par une virgule
                </p>
              </div>
            </div>
          )}

          {formTab === "social" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--admin-text-muted)]">
                  <Globe size={14} className="text-[#1877F2]" />
                  Facebook
                </label>
                <input
                  value={form.facebook}
                  onChange={(e) =>
                    setForm({ ...form, facebook: e.target.value })
                  }
                  className="admin-input w-full"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--admin-text-muted)]">
                  <Globe size={14} className="text-[#E4405F]" />
                  Instagram
                </label>
                <input
                  value={form.instagram}
                  onChange={(e) =>
                    setForm({ ...form, instagram: e.target.value })
                  }
                  className="admin-input w-full"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--admin-text-muted)]">
                  <ExternalLink size={14} className="text-white" />
                  TikTok
                </label>
                <input
                  value={form.tiktok}
                  onChange={(e) =>
                    setForm({ ...form, tiktok: e.target.value })
                  }
                  className="admin-input w-full"
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>
          )}

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
        title="Supprimer l'entraîneur"
        message="Les séances associées seront dissociées."
        loading={deleting}
      />
    </div>
  );
}
