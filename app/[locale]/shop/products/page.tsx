"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Heart, Eye, Search, SlidersHorizontal, X } from "lucide-react";
import { useShopCart } from "@/components/shop/ShopCartProvider";

// ============================================================
// TYPES
// ============================================================

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  productCount: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  productType?: string | null;
  price: number;
  compareAtPrice?: number | null;
  images: string;
  categoryId: number;
  brand?: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  createdAt: string;
  category: { id: number; name: string; slug: string };
}

type SortOption = "newest" | "price_asc" | "price_desc" | "rating" | "popular";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Reviewed" },
];

// ============================================================
// PRODUCT CARD (Framer Motion)
// ============================================================

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useShopCart();
  const router = useRouter();

  let images: string[] = [];
  try { images = JSON.parse(product.images); } catch { images = []; }
  const mainImage = images[0] || "";
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
  const inStock = product.stock > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: String(product.id),
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,
      quantity: 1,
    });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl bg-surface border border-border transition-colors duration-500 hover:border-accent/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(212,175,55,0.05)]"
    >
      <Link href={`/shop/products/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-surface-elevated">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-surface-elevated animate-[shimmer_2s_infinite]" />
          )}
          {mainImage && (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onLoad={() => setImageLoaded(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="rounded-lg bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-on-accent">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded-lg bg-surface-elevated backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text">
                Best Seller
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                isWishlisted
                  ? "bg-accent text-text-on-accent"
                  : "bg-[var(--c-overlay)] backdrop-blur-sm text-text-secondary hover:bg-accent hover:text-text-on-accent"
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/shop/products/${product.slug}`); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--c-overlay)] backdrop-blur-sm text-text-secondary transition-all duration-300 hover:bg-accent hover:text-text-on-accent"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 p-5">
          {product.brand && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-muted">
              {product.brand}
            </span>
          )}
          <h3 className="text-sm font-semibold text-text line-clamp-1 transition-colors duration-300 group-hover:text-accent">
            {product.name}
          </h3>

          {product.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.round(product.rating)
                        ? "fill-accent text-accent"
                        : "fill-border text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-text-dim">({product.reviewCount})</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 mt-1">
            <span className="gold-text text-lg font-bold">{product.price.toFixed(2)} TND</span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <span className="text-sm text-text-dim line-through">{product.compareAtPrice.toFixed(2)} TND</span>
            )}
          </div>

          <span className={`text-[10px] font-medium uppercase tracking-wider ${inStock ? "text-emerald-400/70" : "text-red-400/70"}`}>
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-5 pb-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-dim border border-accent/20 py-3 text-xs font-bold uppercase tracking-wider text-accent transition-all duration-300 hover:bg-accent hover:text-text-on-accent hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============================================================
// LOADING SKELETON
// ============================================================

function ProductSkeleton() {
  return (
    <div className="rounded-2xl bg-surface border border-border overflow-hidden">
      <div className="aspect-square bg-surface-elevated animate-[shimmer_2s_infinite]" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 bg-white/5 rounded" />
        <div className="h-4 w-3/4 bg-white/5 rounded" />
        <div className="h-3 w-20 bg-white/5 rounded" />
        <div className="h-5 w-24 bg-white/5 rounded" />
      </div>
    </div>
  );
}

// ============================================================
// ANIMATED GRID WRAPPER
// ============================================================

function AnimatedGrid({ products }: { products: Product[] }) {
  return (
    <motion.div
      layout
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
    >
      <AnimatePresence mode="popLayout">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// MAIN CONTENT
// ============================================================

function ShopProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/shop/products?limit=100"),
          fetch("/api/shop/categories"),
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(prodData.data || []);
        setCategories(catData.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory) {
      result = result.filter((p) => p.category?.slug === activeCategory);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case "price_asc": result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "popular": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "newest":
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, activeCategory, sort, search]);

  const handleCategoryChange = useCallback((slug: string) => {
    setActiveCategory(slug);
  }, []);

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name || "All Supplements";

  return (
    <section className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-bg via-surface to-bg">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_60%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-28 lg:pt-32 pb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-text mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {activeCategory ? (
              <>{activeCategoryName} <span className="gold-text">Collection</span></>
            ) : (
              <>All <span className="gold-text">Supplements</span></>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-text-dim text-sm"
          >
            {filteredProducts.length} premium supplement{filteredProducts.length !== 1 ? "s" : ""}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange("")}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeCategory === ""
                  ? "bg-accent text-text-on-accent shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                  : "bg-surface-elevated text-text-muted border border-border hover:bg-surface-elevated hover:text-text-secondary"
              }`}
            >
              All
            </motion.button>
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === cat.slug
                    ? "bg-accent text-text-on-accent shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                    : "bg-surface-elevated text-text-muted border border-border hover:bg-surface-elevated hover:text-text-secondary"
                }`}
              >
                {cat.icon && <span className="text-base">{cat.icon}</span>}
                {cat.name}
              </motion.button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, brand..."
                className="w-full bg-surface-elevated border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/30 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="relative">
              <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none bg-surface-elevated border border-border rounded-xl pl-10 pr-8 py-3 text-sm text-text-secondary focus:outline-none focus:border-accent/30 transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-surface">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <ShoppingCart className="h-16 w-16 text-text-dim mx-auto mb-4" />
            <p className="text-text-muted text-lg font-medium mb-2">No products found</p>
            <p className="text-text-dim text-sm">
              {search ? "Try a different search term" : "No products in this category yet"}
            </p>
            {(search || activeCategory) && (
              <button
                onClick={() => { handleCategoryChange(""); setSearch(""); }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-accent-dim border border-accent/20 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatedGrid products={filteredProducts} />
        )}
      </div>
    </section>
  );
}

// ============================================================
// DEFAULT EXPORT (with Suspense)
// ============================================================

export default function ShopProductsPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-28">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      }
    >
      <ShopProductsContent />
    </Suspense>
  );
}
