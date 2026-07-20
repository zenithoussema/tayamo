"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  AlertTriangle,
  ArrowRight,
  Trash,
  X,
} from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import Modal from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";
import { CardSkeleton } from "@/components/admin/ui/Skeleton";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  _count: { products: number };
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  imageUrl: "",
  sortOrder: "0",
  isActive: true,
};

export default function AdminShopCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete flow state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "choose" | "reassign" | "force-confirm" | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const prevSearch = useRef("");
  const limit = 20;
  const { addToast } = useToast();

  const fetchCategories = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q) params.set("q", q);
      const res = await adminFetch(`/api/admin/shop/categories?${params}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setCategories(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Loading error");
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
    fetchCategories(page, search);
  }, [fetchCategories, page, search]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "",
      imageUrl: cat.imageUrl || "",
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name) {
      addToast("Category name is required", "error");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: form.description || null,
        icon: form.icon || null,
        imageUrl: form.imageUrl || null,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      const url = editId
        ? `/api/admin/shop/categories/${editId}`
        : "/api/admin/shop/categories";
      const method = editId ? "PATCH" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }

      addToast(editId ? "Category updated" : "Category created", "success");
      setShowForm(false);
      fetchCategories(page, search);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  // === DELETE FLOW ===

  function startDelete(cat: Category) {
    setDeleteTarget(cat);
    setDeleteError(null);
    setReassignTargetId(null);

    if (cat._count.products > 0) {
      setDeleteStep("choose");
    } else {
      setDeleteStep("confirm");
    }
  }

  function closeDelete() {
    setDeleteTarget(null);
    setDeleteStep(null);
    setReassignTargetId(null);
    setDeleteError(null);
  }

  // Option 1: Reassign products then delete
  async function handleReassign() {
    if (!deleteTarget || !reassignTargetId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await adminFetch(`/api/admin/shop/categories/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moveToCategoryId: reassignTargetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      addToast(data.message, "success");
      closeDelete();
      fetchCategories(page, search);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : "Failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Option 2: Force delete (category + all products)
  async function handleForceDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await adminFetch(`/api/admin/shop/categories/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      addToast(data.message, "success");
      closeDelete();
      fetchCategories(page, search);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : "Failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Simple delete (no products)
  async function handleSimpleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await adminFetch(`/api/admin/shop/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      addToast("Category deleted", "success");
      closeDelete();
      fetchCategories(page, search);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : "Failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  const otherCategories = categories.filter((c) => c.id !== deleteTarget?.id);

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-gold)]/15">
            <FolderTree size={20} className="text-[var(--admin-gold)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--admin-text)]">Shop Categories</h1>
            <p className="text-sm text-[var(--admin-text-muted)]">{total} categor{total !== 1 ? "ies" : "y"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = "/admin/shop/products"}
            className="admin-btn admin-btn-ghost"
          >
            Back to Products
          </button>
          <button onClick={openCreate} className="admin-btn admin-btn-gold flex items-center gap-2">
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <div className="w-full sm:w-72">
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." />
      </div>

      {error ? (
        <div className="admin-card rounded-2xl p-8 text-center">
          <p className="text-[var(--admin-danger)]">{error}</p>
          <button onClick={() => fetchCategories(page, search)} className="admin-btn admin-btn-ghost mt-3">
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="admin-card rounded-2xl p-8 text-center">
          <FolderTree size={40} className="mx-auto mb-3 text-[var(--admin-text-dim)]" />
          <p className="font-medium text-[var(--admin-text-muted)]">No categories found</p>
          <p className="mt-1 text-sm text-[var(--admin-text-dim)]">
            {search ? "Try a different search term" : "Create your first category to get started"}
          </p>
          {!search && (
            <button onClick={openCreate} className="admin-btn admin-btn-gold mt-4">
              <Plus size={16} className="mr-2 inline" />
              Add Category
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="admin-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Sort</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Products</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-[var(--admin-text-dim)]">
                          <GripVertical size={14} />
                          <span className="text-xs">{cat.sortOrder}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {cat.icon && <span className="text-lg">{cat.icon}</span>}
                          <div>
                            <p className="text-sm font-medium text-[var(--admin-text)]">{cat.name}</p>
                            {cat.description && (
                              <p className="text-xs text-[var(--admin-text-dim)] line-clamp-1">{cat.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-[var(--admin-text-dim)] bg-white/5 px-2 py-0.5 rounded">{cat.slug}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${cat._count.products > 0 ? "text-[var(--admin-gold)] font-medium" : "text-[var(--admin-text-muted)]"}`}>
                          {cat._count.products}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          cat.isActive ? "text-green-400 bg-green-400/10" : "text-gray-400 bg-gray-400/10"
                        }`}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="rounded-lg p-1.5 text-[var(--admin-text-dim)] transition-colors hover:bg-[var(--admin-gold)]/15 hover:text-[var(--admin-gold)]"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => startDelete(cat)}
                            className="rounded-lg p-1.5 text-[var(--admin-text-dim)] transition-colors hover:bg-[var(--admin-danger)]/15 hover:text-[var(--admin-danger)]"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      {/* CREATE/EDIT MODAL */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? "Edit Category" : "Create Category"}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Category Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input"
                placeholder="Whey Protein"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="admin-input"
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--admin-text-muted)]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="admin-input min-h-[60px] resize-y"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Icon (emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="admin-input"
                placeholder="💪"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="admin-input"
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Status</label>
              <select
                value={form.isActive ? "true" : "false"}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                className="admin-input"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button onClick={() => setShowForm(false)} disabled={saving} className="admin-btn admin-btn-ghost">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-gold">
              {saving ? "Saving..." : editId ? "Update Category" : "Create Category"}
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE STEP 1: Simple confirm (no products) */}
      {deleteStep === "confirm" && deleteTarget && (
        <Modal isOpen={true} onClose={closeDelete} title="Delete Category">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl bg-[var(--admin-danger)]/10 p-4">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[var(--admin-danger)]" />
              <div>
                <p className="font-medium text-[var(--admin-text)]">Delete &ldquo;{deleteTarget.name}&rdquo;?</p>
                <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                  This category has no products. It will be permanently deleted.
                </p>
              </div>
            </div>
            {deleteError && (
              <p className="text-sm text-[var(--admin-danger)]">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={closeDelete} disabled={deleteLoading} className="admin-btn admin-btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleSimpleDelete}
                disabled={deleteLoading}
                className="admin-btn bg-[var(--admin-danger)] text-white hover:bg-[var(--admin-danger)]/80"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE STEP 2: Choose action (has products) */}
      {deleteStep === "choose" && deleteTarget && (
        <Modal isOpen={true} onClose={closeDelete} title="Delete Category">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-4">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-400" />
              <div>
                <p className="font-medium text-[var(--admin-text)]">
                  &ldquo;{deleteTarget.name}&rdquo; has {deleteTarget._count.products} product(s)
                </p>
                <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                  Choose how to handle the products before deleting this category.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setDeleteStep("reassign")}
                className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-left transition-colors hover:border-[var(--admin-gold)]/30 hover:bg-[var(--admin-gold)]/5"
              >
                <ArrowRight size={18} className="shrink-0 text-[var(--admin-gold)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--admin-text)]">Move products to another category</p>
                  <p className="text-xs text-[var(--admin-text-dim)]">Reassign all {deleteTarget._count.products} product(s) then delete</p>
                </div>
              </button>

              <button
                onClick={() => setDeleteStep("force-confirm")}
                className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-left transition-colors hover:border-[var(--admin-danger)]/30 hover:bg-[var(--admin-danger)]/5"
              >
                <Trash size={18} className="shrink-0 text-[var(--admin-danger)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--admin-text)]">Delete category AND all products</p>
                  <p className="text-xs text-[var(--admin-text-dim)]">Permanently remove {deleteTarget._count.products} product(s)</p>
                </div>
              </button>
            </div>

            <div className="flex justify-end border-t border-white/5 pt-4">
              <button onClick={closeDelete} className="admin-btn admin-btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE STEP 3a: Reassign products */}
      {deleteStep === "reassign" && deleteTarget && (
        <Modal isOpen={true} onClose={closeDelete} title="Move Products">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--admin-text-muted)]">
              Move <strong className="text-[var(--admin-text)]">{deleteTarget._count.products} product(s)</strong> from &ldquo;{deleteTarget.name}&rdquo; to:
            </p>

            <select
              value={reassignTargetId || ""}
              onChange={(e) => setReassignTargetId(Number(e.target.value) || null)}
              className="admin-input"
            >
              <option value="">-- Select target category --</option>
              {otherCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name} ({c._count.products} products)
                </option>
              ))}
            </select>

            {deleteError && (
              <p className="text-sm text-[var(--admin-danger)]">{deleteError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={closeDelete} disabled={deleteLoading} className="admin-btn admin-btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={deleteLoading || !reassignTargetId}
                className="admin-btn admin-btn-gold"
              >
                {deleteLoading ? "Moving..." : "Move & Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE STEP 3b: Force confirm */}
      {deleteStep === "force-confirm" && deleteTarget && (
        <Modal isOpen={true} onClose={closeDelete} title="Confirm Permanent Deletion">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl bg-[var(--admin-danger)]/10 p-4">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[var(--admin-danger)]" />
              <div>
                <p className="font-medium text-[var(--admin-danger)]">This action cannot be undone</p>
                <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                  You are about to permanently delete:
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-[var(--admin-text-muted)]">
                  <li>Category: <strong>{deleteTarget.name}</strong></li>
                  <li>All <strong>{deleteTarget._count.products}</strong> product(s) in this category</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">
                Type <strong className="text-[var(--admin-danger)]">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="DELETE"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value === "DELETE") {
                    handleForceDelete();
                  }
                }}
              />
            </div>

            {deleteError && (
              <p className="text-sm text-[var(--admin-danger)]">{deleteError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={closeDelete} disabled={deleteLoading} className="admin-btn admin-btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleForceDelete}
                disabled={deleteLoading}
                className="admin-btn bg-[var(--admin-danger)] text-white hover:bg-[var(--admin-danger)]/80"
              >
                {deleteLoading ? "Deleting..." : "Delete Everything"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
