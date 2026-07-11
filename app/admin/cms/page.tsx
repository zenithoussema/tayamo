"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Eye,
  EyeOff,
  Pencil,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Save,
  ExternalLink,
  Layout,
} from "lucide-react";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";

interface Section {
  id: string;
  type: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  visible: boolean;
  order: number;
  settings: Record<string, string>;
}

const SECTION_TYPES: Record<string, { label: string; color: string }> = {
  hero: { label: "Hero", color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  about: { label: "À propos", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  activities: { label: "Activités", color: "bg-green-500/15 text-green-400 border-green-500/20" },
  trainers: { label: "Entraîneurs", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  testimonials: { label: "Témoignages", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  gallery: { label: "Galerie", color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  contact: { label: "Contact", color: "bg-teal-500/15 text-teal-400 border-teal-500/20" },
  cta: { label: "CTA", color: "bg-[var(--admin-gold)]/15 text-[var(--admin-gold)] border-[var(--admin-gold)]/20" },
};

export default function CmsPage() {
  const { addToast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editForm, setEditForm] = useState<Section | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/cms/sections");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setSections(data.sort((a: Section, b: Section) => a.order - b.order));
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    (async () => { await fetchSections(); })();
  }, [fetchSections]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/cms/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sections),
      });
      if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
      addToast("Sections enregistrées", "success");
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setSections((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;

      const temp = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[targetIdx].order };
      sorted[targetIdx] = { ...sorted[targetIdx], order: temp };

      return sorted.sort((a, b) => a.order - b.order);
    });
  };

  const openEdit = (section: Section) => {
    setEditingSection(section);
    setEditForm({ ...section, settings: { ...section.settings } });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setSections((prev) => prev.map((s) => (s.id === editForm.id ? editForm : s)));
    setEditingSection(null);
    setEditForm(null);
    addToast("Section mise à jour", "success");
  };

  const handleDuplicate = (section: Section) => {
    const copy: Section = {
      ...section,
      id: `${section.id}_copy_${Date.now()}`,
      title: `${section.title} (copie)`,
      order: Math.max(...sections.map((s) => s.order)) + 1,
      settings: { ...section.settings },
    };
    setSections((prev) => [...prev, copy]);
    addToast("Section dupliquée", "success");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/cms/sections/${deleteTarget}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setSections((prev) => prev.filter((s) => s.id !== deleteTarget));
      addToast("Section supprimée", "success");
      setDeleteTarget(null);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Erreur lors de la suppression", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkShow = () => {
    setSections((prev) => prev.map((s) => ({ ...s, visible: true })));
    addToast("Toutes les sections sont maintenant visibles", "success");
  };

  const handleBulkHide = () => {
    setSections((prev) => prev.map((s) => ({ ...s, visible: false })));
    addToast("Toutes les sections sont maintenant masquées", "info");
  };

  const handleDuplicateAll = () => {
    const maxOrder = Math.max(...sections.map((s) => s.order), 0);
    const copies = sections.map((s, i) => ({
      ...s,
      id: `${s.id}_dup_${Date.now()}_${i}`,
      title: `${s.title} (copie)`,
      order: maxOrder + i + 1,
      settings: { ...s.settings },
    }));
    setSections((prev) => [...prev, ...copies]);
    addToast(`${copies.length} section(s) dupliquée(s)`, "success");
  };

  const updateEditSetting = (key: string, value: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      settings: { ...editForm.settings, [key]: value },
    });
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Constructeur de page d&apos;accueil</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            {sections.length} section{sections.length !== 1 ? "s" : ""} •{" "}
            {sections.filter((s) => s.visible).length} visible{sections.filter((s) => s.visible).length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-ghost flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <ExternalLink size={16} />
            Prévisualiser
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleBulkShow}
          className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text-muted)] hover:bg-white/[0.03] transition-colors"
        >
          <Eye size={14} />
          Tout afficher
        </button>
        <button
          onClick={handleBulkHide}
          className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text-muted)] hover:bg-white/[0.03] transition-colors"
        >
          <EyeOff size={14} />
          Tout masquer
        </button>
        <button
          onClick={handleDuplicateAll}
          className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text-muted)] hover:bg-white/[0.03] transition-colors"
        >
          <Copy size={14} />
          Dupliquer la page
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-card h-24 animate-pulse rounded-xl bg-[var(--admin-surface)]" />
          ))}
        </div>
      ) : sortedSections.length === 0 ? (
        <div className="admin-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <Layout size={28} className="mb-4 text-[var(--admin-text-dim)]" />
          <h3 className="mb-1 text-lg font-semibold text-[var(--admin-text)]">Aucune section</h3>
          <p className="text-sm text-[var(--admin-text-muted)]">Commencez à créer votre page d&apos;accueil</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSections.map((section, idx) => {
            const typeInfo = SECTION_TYPES[section.type] || { label: section.type, color: "bg-gray-500/15 text-gray-400 border-gray-500/20" };
            return (
              <div
                key={section.id}
                className={`admin-card rounded-xl border p-4 transition-all duration-200 ${
                  section.visible
                    ? "border-[var(--admin-border)]"
                    : "border-[var(--admin-border)] opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5 text-[var(--admin-text-dim)]">
                    <GripVertical size={16} className="opacity-30" />
                    <span className="text-[10px] font-mono">{idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSection(section.id, "up")}
                      disabled={idx === 0}
                      className="rounded p-1 text-[var(--admin-text-dim)] hover:bg-white/[0.05] disabled:opacity-30 transition-colors"
                      title="Monter"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveSection(section.id, "down")}
                      disabled={idx === sortedSections.length - 1}
                      className="rounded p-1 text-[var(--admin-text-dim)] hover:bg-white/[0.05] disabled:opacity-30 transition-colors"
                      title="Descendre"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleVisibility(section.id)}
                    className="rounded-lg p-2 text-[var(--admin-text-dim)] hover:bg-white/[0.05] transition-colors"
                    title={section.visible ? "Masquer" : "Afficher"}
                  >
                    {section.visible ? <Eye size={16} className="text-[var(--admin-gold)]" /> : <EyeOff size={16} />}
                  </button>

                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${section.visible ? "text-[var(--admin-text)]" : "text-[var(--admin-text-muted)]"}`}>
                      {section.title}
                    </p>
                    {section.description && (
                      <p className="text-xs text-[var(--admin-text-dim)] truncate">{section.description}</p>
                    )}
                  </div>

                  {section.imageUrl && (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--admin-border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={section.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(section)}
                      className="rounded-lg p-2 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-[var(--admin-text)] transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(section)}
                      className="rounded-lg p-2 text-[var(--admin-text-dim)] hover:bg-white/[0.05] hover:text-[var(--admin-text)] transition-colors"
                      title="Dupliquer"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(section.id)}
                      className="rounded-lg p-2 text-[var(--admin-text-dim)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Masquer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!editingSection}
        onClose={() => { setEditingSection(null); setEditForm(null); }}
        title={`Modifier: ${editForm?.title || ""}`}
        maxWidth="max-w-2xl"
      >
        {editForm && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Titre</label>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="admin-input w-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="admin-input w-full resize-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">URL de l&apos;image</label>
              <input
                value={editForm.imageUrl}
                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                placeholder="https://..."
                className="admin-input w-full"
              />
              {editForm.imageUrl && (
                <div className="mt-2 h-32 overflow-hidden rounded-xl border border-[var(--admin-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editForm.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            {editForm.type === "hero" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">URL de la vidéo</label>
                <input
                  value={editForm.videoUrl || ""}
                  onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
                  placeholder="YouTube ou Vimeo URL"
                  className="admin-input w-full"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-visible"
                checked={editForm.visible}
                onChange={(e) => setEditForm({ ...editForm, visible: e.target.checked })}
                className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]"
              />
              <label htmlFor="edit-visible" className="text-sm text-[var(--admin-text-muted)]">
                Visible sur le site
              </label>
            </div>

            {(editForm.type === "hero" || editForm.type === "cta") && (
              <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-dim)]">
                  Paramètres {editForm.type === "hero" ? "Hero" : "CTA"}
                </p>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Texte du bouton</label>
                  <input
                    value={editForm.settings?.ctaText || ""}
                    onChange={(e) => updateEditSetting("ctaText", e.target.value)}
                    className="admin-input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Lien du bouton</label>
                  <input
                    value={editForm.settings?.ctaLink || ""}
                    onChange={(e) => updateEditSetting("ctaLink", e.target.value)}
                    className="admin-input w-full"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
              <button
                onClick={() => { setEditingSection(null); setEditForm(null); }}
                className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer la section"
        message="Cette section sera définitivement supprimée de la page d'accueil."
        confirmLabel="Supprimer"
        loading={deleting}
      />
    </div>
  );
}
