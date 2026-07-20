"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Newspaper,
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Upload,
  X,
  Play,
} from "lucide-react";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import { CardSkeleton } from "@/components/admin/ui/Skeleton";
import Tabs from "@/components/admin/ui/Tabs";
import Modal from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";

interface NewsItem {
  id: number;
  title: string;
  titleAr: string | null;
  content: string;
  contentAr: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { key: "NEWS", label: "Actualités" },
  { key: "EVENT", label: "Événements" },
  { key: "ANNOUNCEMENT", label: "Annonces" },
  { key: "ADMIN_POST", label: "Publications" },
];

const CATEGORY_COLORS: Record<string, string> = {
  NEWS: "bg-blue-500/15 text-blue-400",
  EVENT: "bg-purple-500/15 text-purple-400",
  ANNOUNCEMENT: "bg-amber-500/15 text-amber-400",
  ADMIN_POST: "bg-green-500/15 text-green-400",
};

const emptyForm = {
  title: "",
  titleAr: "",
  content: "",
  contentAr: "",
  imageUrl: "",
  videoUrl: "",
  category: "NEWS",
  isPublished: false,
  isFeatured: false,
};

export default function AdminNewsPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const limit = 12;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.set("q", search);
      if (activeTab !== "all") params.set("category", activeTab);

      const res = await adminFetch(`/api/admin/news?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTab]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const tabs = [
    { key: "all", label: "Tous", count: total },
    ...CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label,
      count: items.filter((i) => i.category === c.key).length,
    })),
  ];

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      titleAr: item.titleAr || "",
      content: item.content,
      contentAr: item.contentAr || "",
      imageUrl: item.imageUrl || "",
      videoUrl: item.videoUrl || "",
      category: item.category,
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await adminFetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, imageUrl: data.url }));
        addToast("Image uploaded", "success");
      } else {
        addToast("Upload failed", "error");
      }
    } catch {
      addToast("Upload failed", "error");
    }
    setUploadingImage(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      addToast("Title and content are required", "error");
      return;
    }
    setSaving(true);
    try {
      const url = editingItem
        ? `/api/admin/news/${editingItem.id}`
        : "/api/admin/news";
      const method = editingItem ? "PATCH" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          titleAr: form.titleAr || null,
          contentAr: form.contentAr || null,
          imageUrl: form.imageUrl || null,
          videoUrl: form.videoUrl || null,
        }),
      });

      if (res.ok) {
        addToast(editingItem ? "News updated" : "News created", "success");
        setShowForm(false);
        fetchItems();
      } else {
        const err = await res.json();
        addToast(err.error || "Failed to save", "error");
      }
    } catch {
      addToast("Failed to save", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/news/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast("News deleted", "success");
        setDeleteTarget(null);
        fetchItems();
      } else {
        addToast("Failed to delete", "error");
      }
    } catch {
      addToast("Failed to delete", "error");
    }
    setDeleting(false);
  };

  const togglePublish = async (item: NewsItem) => {
    const res = await adminFetch(`/api/admin/news/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !item.isPublished }),
    });
    if (res.ok) {
      addToast(item.isPublished ? "Unpublished" : "Published", "success");
      fetchItems();
    }
  };

  const toggleFeatured = async (item: NewsItem) => {
    const res = await adminFetch(`/api/admin/news/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !item.isFeatured }),
    });
    if (res.ok) {
      addToast(item.isFeatured ? "Removed from featured" : "Marked as featured", "success");
      fetchItems();
    }
  };

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Actualités</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            {total} article{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="admin-input w-48 rounded-xl px-3 py-2.5 text-sm"
          />
          <button
            onClick={openCreate}
            className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> New Post
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={(t) => { setActiveTab(t); setPage(1); }} />

      {loading ? (
        <CardSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={28} className="text-[var(--admin-text-dim)]" />}
          title="No news yet"
          description="Create your first news post to get started"
          action={
            <button onClick={openCreate} className="admin-btn-gold mt-4 rounded-xl px-4 py-2.5 text-sm font-medium">
              <Plus size={16} className="mr-2 inline" /> Create Post
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] transition-all hover:border-white/10"
              >
                {/* Media */}
                <div className="relative aspect-video overflow-hidden bg-white/[0.02]">
                  {item.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : item.videoUrl ? (
                    <div className="flex h-full items-center justify-center">
                      <Play size={40} className="text-[var(--admin-gold)]/40" />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Newspaper size={40} className="text-[var(--admin-text-d)]/20" />
                    </div>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button
                        onClick={() => togglePublish(item)}
                        className="rounded-lg bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        title={item.isPublished ? "Unpublish" : "Publish"}
                      >
                        {item.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => toggleFeatured(item)}
                        className="rounded-lg bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        title={item.isFeatured ? "Remove from featured" : "Mark as featured"}
                      >
                        <Star size={14} className={item.isFeatured ? "fill-[var(--admin-gold)] text-[var(--admin-gold)]" : ""} />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-[var(--admin-gold)]/60"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="rounded-lg bg-[var(--admin-danger)]/80 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-[var(--admin-danger)]"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="absolute left-3 top-3 flex gap-1">
                    {!item.isPublished && (
                      <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/60 backdrop-blur-sm">
                        Draft
                      </span>
                    )}
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm ${CATEGORY_COLORS[item.category] || "bg-white/10 text-white/60"}`}>
                      {CATEGORIES.find((c) => c.key === item.category)?.label || item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-white">{item.title}</h3>
                  {item.titleAr && (
                    <p className="mb-1 line-clamp-1 text-xs text-white/30" dir="rtl">{item.titleAr}</p>
                  )}
                  <p className="mb-3 line-clamp-2 text-xs text-[var(--admin-text-muted)]">{item.content}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--admin-text-dim)]">
                    <Calendar size={12} />
                    <span>
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                        : new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                      }
                    </span>
                    {item.isFeatured && (
                      <span className="ml-auto rounded bg-[var(--admin-gold)]/10 px-1.5 py-0.5 text-[var(--admin-gold)]">Featured</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingItem ? "Edit News" : "Create News Post"}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Title (FR) *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="News title"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Title (AR)</label>
              <input
                value={form.titleAr}
                onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                placeholder="عنوان الخبر"
                className="admin-input w-full"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Content (FR) *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your news content..."
                rows={5}
                className="admin-input w-full resize-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Content (AR)</label>
              <textarea
                value={form.contentAr}
                onChange={(e) => setForm((f) => ({ ...f, contentAr: e.target.value }))}
                placeholder="اكتب محتوى الخبر..."
                rows={5}
                className="admin-input w-full resize-none"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="admin-select w-full"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Video URL (optional)</label>
              <input
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="admin-input w-full"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Image</label>
            {form.imageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-[var(--admin-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="Preview" className="h-40 w-full object-cover" />
                <button
                  onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                  className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-[var(--admin-danger)] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center transition-colors hover:border-[var(--admin-gold)]/40 hover:bg-white/[0.04]">
                <Upload size={24} className="text-[var(--admin-gold)]/60" />
                <span className="text-sm text-[var(--admin-text-muted)]">
                  {uploadingImage ? "Uploading..." : "Click to upload an image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]"
              />
              Publish now
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="h-4 w-4 rounded border-white/10 accent-[var(--admin-gold)]"
              />
              Featured
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button onClick={() => setShowForm(false)} className="admin-btn-ghost rounded-lg px-4 py-2.5 text-sm font-medium">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn-gold rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : editingItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete news post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action is irreversible.`}
        loading={deleting}
      />
    </div>
  );
}
