"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Pencil,
  GripVertical,
  X,
  Upload,
} from "lucide-react";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { CardSkeleton } from "@/components/admin/ui/Skeleton";
import Tabs from "@/components/admin/ui/Tabs";
import Modal from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";

interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  category: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
}

const CATEGORIES = ["Général", "Équipements", "Cours", "Événements", "Avant/Après"];

export default function GalleryPage() {
  const { addToast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteMode, setDeleteMode] = useState<"single" | "bulk" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("Général");
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [editImage, setEditImage] = useState<GalleryImage | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editCategory, setEditCategory] = useState("Général");
  const [editCaption, setEditCaption] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const limit = 12;

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await adminFetch(`/api/admin/gallery?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setImages(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setImages([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    (async () => { await fetchImages(); })();
  }, [fetchImages]);

  const filteredImages =
    activeTab === "all"
      ? images
      : images.filter((img) => img.category === activeTab);

  const categoryCounts = images.reduce(
    (acc, img) => {
      acc[img.category] = (acc[img.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const tabs = [
    { key: "all", label: "Tous", count: images.length },
    ...CATEGORIES.map((cat) => ({
      key: cat,
      label: cat,
      count: categoryCounts[cat] || 0,
    })),
  ];

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredImages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredImages.map((img) => img.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    const res = await adminFetch("/api/admin/gallery/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });
    if (res.ok) {
      addToast(`${selectedIds.size} image(s) supprimée(s)`, "success");
      setSelectedIds(new Set());
      setDeleteMode(null);
      fetchImages();
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const handleSingleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await adminFetch(`/api/admin/gallery/${deleteTarget}`, {
      method: "DELETE",
    });
    if (res.ok) {
      addToast("Image supprimée", "success");
      setDeleteTarget(null);
      fetchImages();
    } else {
      addToast("Erreur lors de la suppression", "error");
    }
    setDeleting(false);
  };

  const moveImage = async (id: number, direction: "up" | "down") => {
    const idx = images.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const swapped = direction === "up" ? idx - 1 : idx + 1;
    if (swapped < 0 || swapped >= images.length) return;
    const ids = images.map((img) => img.id);
    [ids[idx], ids[swapped]] = [ids[swapped], ids[idx]];
    const res = await adminFetch("/api/admin/gallery/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) fetchImages();
  };

  const toggleFeatured = async (img: GalleryImage) => {
    const res = await adminFetch(`/api/admin/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !img.featured }),
    });
    if (res.ok) {
      addToast(img.featured ? "Image retirée des vedettes" : "Image mise en vedette", "success");
      fetchImages();
    }
  };

  const openEdit = (img: GalleryImage) => {
    setEditImage(img);
    setEditAlt(img.alt);
    setEditCategory(img.category);
    setEditCaption("");
  };

  const handleSaveEdit = async () => {
    if (!editImage) return;
    setSavingEdit(true);
    const res = await adminFetch(`/api/admin/gallery/${editImage.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt: editAlt, category: editCategory }),
    });
    if (res.ok) {
      addToast("Image mise à jour", "success");
      setEditImage(null);
      fetchImages();
    } else {
      addToast("Erreur lors de la mise à jour", "error");
    }
    setSavingEdit(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removePendingFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkUpload = async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < pendingFiles.length; i++) {
      try {
        const formData = new FormData();
        formData.append("file", pendingFiles[i]);
        const uploadRes = await adminFetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          await adminFetch("/api/admin/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: uploadData.url,
              alt: "",
              category: uploadCategory,
              featured: false,
            }),
          });
          successCount++;
        }
      } catch {}
    }

    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPendingFiles([]);
    setPreviewUrls([]);
    setShowUpload(false);
    addToast(`${successCount} image(s) ajoutée(s)`, "success");
    fetchImages();
    setUploading(false);
  };

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Galerie</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            {total} image{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setDeleteMode("bulk")}
              className="admin-btn-danger flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              Supprimer la sélection ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setShowUpload(true)}
            className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {error ? (
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button
            onClick={fetchImages}
            className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <CardSkeleton count={6} />
      ) : filteredImages.length === 0 ? (
        <EmptyState
          icon={<ImageIcon size={28} className="text-[var(--admin-text-dim)]" />}
          title="Aucune image"
          description="Ajoutez des images à votre galerie"
        />
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-3">
            <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredImages.length && filteredImages.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]"
              />
              Tout sélectionner
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredImages.map((img, idx) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-xl bg-[var(--admin-surface)] border border-[var(--admin-border)]"
              >
                <div className="relative aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="absolute left-3 top-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(img.id)}
                      onChange={() => toggleSelect(img.id)}
                      className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)] bg-black/40 backdrop-blur-sm"
                    />
                  </div>

                  <button
                    onClick={() => toggleFeatured(img)}
                    className="absolute right-3 top-3 z-10 rounded-lg bg-black/40 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/60"
                    title={img.featured ? "Retirer des vedettes" : "Mettre en vedette"}
                  >
                    <Star
                      size={16}
                      className={img.featured ? "fill-[var(--admin-gold)] text-[var(--admin-gold)]" : "text-white/60"}
                    />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveImage(img.id, "up")}
                        disabled={idx === 0}
                        className="rounded bg-white/20 p-1 text-white backdrop-blur-sm disabled:opacity-30 transition-colors hover:bg-white/30"
                        title="Monter"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveImage(img.id, "down")}
                        disabled={idx === images.length - 1}
                        className="rounded bg-white/20 p-1 text-white backdrop-blur-sm disabled:opacity-30 transition-colors hover:bg-white/30"
                        title="Descendre"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(img)}
                        className="rounded bg-white/20 p-1 text-white backdrop-blur-sm transition-colors hover:bg-[var(--admin-gold)]/60"
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(img.id);
                          setDeleteMode("single");
                        }}
                        className="rounded bg-[var(--admin-danger)]/80 p-1 text-white backdrop-blur-sm hover:bg-[var(--admin-danger)] transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white font-medium">
                        {img.alt || "Sans titre"}
                      </p>
                      <p className="text-xs text-[var(--admin-text-dim)]">
                        {img.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--admin-text-dim)]">
                      <GripVertical size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showUpload} onClose={() => { setShowUpload(false); previewUrls.forEach((u) => URL.revokeObjectURL(u)); setPendingFiles([]); setPreviewUrls([]); }} title="Ajouter des images" maxWidth="max-w-2xl">
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Catégorie</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="admin-select w-full"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--admin-text-muted)]">Fichiers</label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 text-center cursor-pointer transition-colors hover:border-[var(--admin-gold)]/40 hover:bg-white/[0.04]">
              <Upload size={28} className="text-[var(--admin-gold)]/60" />
              <span className="text-sm font-medium text-[var(--admin-text-muted)]">
                Cliquez ou glissez des fichiers ici
              </span>
              <span className="text-xs text-[var(--admin-text-dim)]">
                JPG, PNG, GIF, WebP — Max 5MB par fichier
              </span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-[var(--admin-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Aperçu ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePendingFile(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-[var(--admin-danger)] transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button
              onClick={() => { setShowUpload(false); previewUrls.forEach((u) => URL.revokeObjectURL(u)); setPendingFiles([]); setPreviewUrls([]); }}
              className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleBulkUpload}
              disabled={pendingFiles.length === 0 || uploading}
              className="admin-btn-gold flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Envoi...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Envoyer {pendingFiles.length > 0 && `(${pendingFiles.length})`}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editImage} onClose={() => setEditImage(null)} title="Modifier l'image">
        <div className="flex flex-col gap-4">
          {editImage && (
            <div className="aspect-video overflow-hidden rounded-xl border border-[var(--admin-border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editImage.url} alt={editAlt} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Texte alternatif</label>
            <input
              value={editAlt}
              onChange={(e) => setEditAlt(e.target.value)}
              placeholder="Description de l'image"
              className="admin-input w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Catégorie</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="admin-select w-full"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Légende</label>
            <input
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              placeholder="Optionnel"
              className="admin-input w-full"
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button onClick={() => setEditImage(null)} className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium">
              Annuler
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {savingEdit ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteMode === "bulk"}
        onClose={() => { setDeleteMode(null); setSelectedIds(new Set()); }}
        onConfirm={handleBulkDelete}
        title={`Supprimer ${selectedIds.size} image(s)`}
        message="Cette action est irréversible."
        loading={deleting}
      />
      <ConfirmDialog
        isOpen={deleteMode === "single" && !!deleteTarget}
        onClose={() => { setDeleteMode(null); setDeleteTarget(null); }}
        onConfirm={handleSingleDelete}
        title="Supprimer l'image"
        message="Cette action est irréversible."
        loading={deleting}
      />
    </div>
  );
}
