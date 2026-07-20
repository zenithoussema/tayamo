"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Star,
  Package,
  ArrowUpDown,
} from "lucide-react";
import SearchInput from "@/components/admin/ui/SearchInput";
import Pagination from "@/components/admin/ui/Pagination";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import Tabs from "@/components/admin/ui/Tabs";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { useToast } from "@/components/admin/ui/Toast";
import { CardSkeleton } from "@/components/admin/ui/Skeleton";

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  productType: string | null;
  price: number;
  compareAtPrice: number | null;
  images: string;
  categoryId: number;
  brand: string | null;
  sku: string | null;
  weight: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  tags: string;
  sizes: string;
  colors: string;
  specifications: string;
  createdAt: string;
  category: ProductCategory;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  shortDesc: "",
  productType: "",
  price: "",
  compareAtPrice: "",
  images: [] as string[],
  categoryId: "",
  brand: "",
  sku: "",
  weight: "",
  stock: "0",
  isFeatured: false,
  isNew: false,
  isBestSeller: false,
  isActive: true,
  tags: "",
  sizes: "",
  colors: "",
  specifications: "",
};

const statusTabs = [
  { key: "all", label: "All" },
  { key: "active", label: "Available" },
  { key: "out_of_stock", label: "Out of Stock" },
  { key: "featured", label: "Featured" },
  { key: "hidden", label: "Hidden" },
  { key: "new", label: "New Arrival" },
  { key: "best_seller", label: "Best Seller" },
];

export default function AdminShopProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const prevSearch = useRef("");
  const limit = 12;
  const { addToast } = useToast();

  const fetchProducts = useCallback(async (p: number, q: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q) params.set("q", q);
      if (status !== "all") params.set("status", status);
      const res = await adminFetch(`/api/admin/shop/products?${params}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setProducts(data.data || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Loading error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/shop/categories?limit=100");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const changed = prevSearch.current !== search;
    prevSearch.current = search;
    if (changed) {
      setPage(1);
      return;
    }
    fetchProducts(page, search, statusFilter);
  }, [fetchProducts, page, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditId(product.id);
    let images: string[] = [];
    try { images = JSON.parse(product.images); } catch { images = []; }
    let tags: string[] = [];
    try { tags = JSON.parse(product.tags); } catch { tags = []; }
    let sizes: string[] = [];
    try { sizes = JSON.parse(product.sizes); } catch { sizes = []; }
    let colors: string[] = [];
    try { colors = JSON.parse(product.colors); } catch { colors = []; }
    let specs: Record<string, string> = {};
    try { specs = JSON.parse(product.specifications); } catch { specs = {}; }

    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDesc: product.shortDesc || "",
      productType: product.productType || "",
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      images,
      categoryId: String(product.categoryId),
      brand: product.brand || "",
      sku: product.sku || "",
      weight: product.weight ? String(product.weight) : "",
      stock: String(product.stock),
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      isActive: product.isActive,
      tags: tags.join(", "),
      sizes: sizes.join(", "),
      colors: colors.join(", "),
      specifications: Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join("\n"),
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.description || !form.price || !form.categoryId) {
      addToast("Please fill in all required fields (name, description, price, category)", "error");
      return;
    }

    setSaving(true);
    try {
      const tagsArray = form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
      const sizesArray = form.sizes ? form.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
      const colorsArray = form.colors ? form.colors.split(",").map((c: string) => c.trim()).filter(Boolean) : [];
      const specsObj: Record<string, string> = {};
      if (form.specifications) {
        form.specifications.split("\n").forEach((line: string) => {
          const [key, ...rest] = line.split(":");
          if (key && rest.length > 0) {
            specsObj[key.trim()] = rest.join(":").trim();
          }
        });
      }

      const body = {
        ...form,
        tags: tagsArray,
        sizes: sizesArray,
        colors: colorsArray,
        specifications: specsObj,
      };

      const url = editId
        ? `/api/admin/shop/products/${editId}`
        : "/api/admin/shop/products";
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

      addToast(editId ? "Product updated" : "Product created", "success");
      setShowForm(false);
      fetchProducts(page, search, statusFilter);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/shop/products/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      addToast("Product deleted", "success");
      setDeleteId(null);
      fetchProducts(page, search, statusFilter);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDuplicate(id: number) {
    try {
      const res = await adminFetch(`/api/admin/shop/products/${id}/duplicate`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Duplicate failed");
      }
      addToast("Product duplicated", "success");
      fetchProducts(page, search, statusFilter);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Duplicate failed", "error");
    }
  }

  async function handleToggleActive(id: number, current: boolean) {
    try {
      const res = await adminFetch(`/api/admin/shop/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      addToast(current ? "Product hidden" : "Product published", "success");
      fetchProducts(page, search, statusFilter);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Toggle failed", "error");
    }
  }

  function getMainImage(imagesStr: string): string {
    try {
      const imgs = JSON.parse(imagesStr);
      return imgs[0] || "";
    } catch {
      return "";
    }
  }

  function getStockStatus(stock: number, isActive: boolean) {
    if (!isActive) return { label: "Hidden", color: "text-gray-400 bg-gray-400/10" };
    if (stock === 0) return { label: "Out of Stock", color: "text-red-400 bg-red-400/10" };
    return { label: "Available", color: "text-green-400 bg-green-400/10" };
  }

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-gold)]/15">
            <ShoppingBag size={20} className="text-[var(--admin-gold)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--admin-text)]">Shop Products</h1>
            <p className="text-sm text-[var(--admin-text-muted)]">{total} product{total !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = "/admin/shop/categories"}
            className="admin-btn admin-btn-ghost flex items-center gap-2"
          >
            <Package size={16} />
            Categories
          </button>
          <button onClick={openCreate} className="admin-btn admin-btn-gold flex items-center gap-2">
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products..." />
        </div>
        <Tabs tabs={statusTabs} active={statusFilter} onChange={setStatusFilter} />
      </div>

      {error ? (
        <div className="admin-card rounded-2xl p-8 text-center">
          <p className="text-[var(--admin-danger)]">{error}</p>
          <button onClick={() => fetchProducts(page, search, statusFilter)} className="admin-btn admin-btn-ghost mt-3">
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="admin-card rounded-2xl p-8 text-center">
          <ShoppingBag size={40} className="mx-auto mb-3 text-[var(--admin-text-dim)]" />
          <p className="font-medium text-[var(--admin-text-muted)]">No products found</p>
          <p className="mt-1 text-sm text-[var(--admin-text-dim)]">
            {search ? "Try a different search term" : "Create your first product to get started"}
          </p>
          {!search && (
            <button onClick={openCreate} className="admin-btn admin-btn-gold mt-4">
              <Plus size={16} className="mr-2 inline" />
              Add Product
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Featured</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[var(--admin-text-dim)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => {
                    const mainImage = getMainImage(product.images);
                    const stockStatus = getStockStatus(product.stock, product.isActive);
                    return (
                      <tr key={product.id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--admin-surface)]">
                              {mainImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package size={16} className="text-[var(--admin-text-dim)]" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--admin-text)] line-clamp-1">{product.name}</p>
                              {product.brand && (
                                <p className="text-xs text-[var(--admin-text-dim)]">{product.brand}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[var(--admin-text-muted)]">{product.category?.name || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-sm font-medium text-[var(--admin-gold)]">{product.price.toFixed(2)} TND</span>
                            {product.compareAtPrice && (
                              <p className="text-xs text-[var(--admin-text-dim)] line-through">{product.compareAtPrice.toFixed(2)} TND</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-400" : product.stock < 5 ? "text-yellow-400" : "text-[var(--admin-text-muted)]"}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {product.isFeatured && <Star size={14} className="fill-[var(--admin-gold)] text-[var(--admin-gold)]" />}
                            {product.isNew && <span className="rounded bg-green-400/15 px-1.5 py-0.5 text-[10px] font-bold text-green-400">NEW</span>}
                            {product.isBestSeller && <span className="rounded bg-blue-400/15 px-1.5 py-0.5 text-[10px] font-bold text-blue-400">BEST</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[var(--admin-text-dim)]">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(product)}
                              className="rounded-lg p-1.5 text-[var(--admin-text-dim)] transition-colors hover:bg-[var(--admin-gold)]/15 hover:text-[var(--admin-gold)]"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleActive(product.id, product.isActive)}
                              className="rounded-lg p-1.5 text-[var(--admin-text-dim)] transition-colors hover:bg-white/10 hover:text-[var(--admin-text)]"
                              title={product.isActive ? "Hide" : "Publish"}
                            >
                              {product.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              onClick={() => handleDuplicate(product.id)}
                              className="rounded-lg p-1.5 text-[var(--admin-text-dim)] transition-colors hover:bg-white/10 hover:text-[var(--admin-text)]"
                              title="Duplicate"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(product.id)}
                              className="rounded-lg p-1.5 text-[var(--admin-text-dim)] transition-colors hover:bg-[var(--admin-danger)]/15 hover:text-[var(--admin-danger)]"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? "Edit Product" : "Create Product"}
        maxWidth="max-w-3xl"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input"
                placeholder="Whey Protein Gold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="admin-input"
                placeholder="auto-generated-from-name"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--admin-text-muted)]">Short Description</label>
            <input
              type="text"
              value={form.shortDesc}
              onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
              className="admin-input"
              placeholder="Brief product summary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--admin-text-muted)]">Full Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="admin-input min-h-[100px] resize-y"
              placeholder="Detailed product description..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="admin-input"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="admin-input"
                placeholder="Optimum Nutrition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Product Type</label>
              <input
                type="text"
                value={form.productType}
                onChange={(e) => setForm({ ...form, productType: e.target.value })}
                className="admin-input"
                placeholder="Supplement, Equipment..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Price (TND) *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="admin-input"
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Discount Price (TND)</label>
              <input
                type="number"
                step="0.01"
                value={form.compareAtPrice}
                onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                className="admin-input"
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Stock Quantity</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="admin-input"
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="admin-input"
                placeholder="WP-GOLD-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="admin-input"
                placeholder="2.5"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="admin-input"
                placeholder="protein, muscle, fitness"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Available Sizes (comma separated)</label>
              <input
                type="text"
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                className="admin-input"
                placeholder="S, M, L, XL"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Available Colors (comma separated)</label>
              <input
                type="text"
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                className="admin-input"
                placeholder="Black, Red, Blue"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--admin-text-muted)]">Specifications (one per line, format: Key: Value)</label>
            <textarea
              value={form.specifications}
              onChange={(e) => setForm({ ...form, specifications: e.target.value })}
              className="admin-input min-h-[80px] resize-y font-mono text-xs"
              placeholder={"Flavor: Chocolate\nServing Size: 30g\nServings Per Container: 30"}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--admin-text-muted)]">Product Images</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--admin-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Product ${idx + 1}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40" />
                  <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-all group-hover:opacity-100">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...form.images];
                          [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
                          setForm({ ...form, images: newImages });
                        }}
                        className="rounded bg-black/60 p-1 text-white backdrop-blur-sm text-xs"
                      >
                        <ArrowUpDown size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                      className="rounded bg-black/60 p-1 text-red-400 backdrop-blur-sm text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute left-1.5 bottom-1.5 rounded bg-[var(--admin-gold)] px-1.5 py-0.5 text-[10px] font-bold text-black">
                      MAIN
                    </span>
                  )}
                </div>
              ))}
              <ImageUploader
                currentUrl={null}
                aspectRatio="square"
                onUpload={(url) => setForm({ ...form, images: [...form.images, url] })}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-white/5 pt-4">
            <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="accent-[var(--admin-gold)]"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                className="accent-[var(--admin-gold)]"
              />
              New Arrival
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
              <input
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                className="accent-[var(--admin-gold)]"
              />
              Best Seller
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="accent-[var(--admin-gold)]"
              />
              Active (Published)
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button onClick={() => setShowForm(false)} disabled={saving} className="admin-btn admin-btn-ghost">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-gold">
              {saving ? "Saving..." : editId ? "Update Product" : "Create Product"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
