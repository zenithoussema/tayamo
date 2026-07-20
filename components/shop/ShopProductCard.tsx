"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useShopCart } from "./ShopCartProvider";

interface ShopProduct {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  stock?: number | null;
  brand?: string | null;
  shortDesc?: string | null;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

interface ShopProductCardProps {
  product: ShopProduct;
  locale?: string;
}

export function ShopProductCard({ product, locale = "fr" }: ShopProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useShopCart();
  const router = useRouter();

  const images = product.images ? JSON.parse(product.images) : [];
  const mainImage = images[0] || "";
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
  const inStock = !product.stock || product.stock > 0;

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
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl bg-surface border border-border transition-colors duration-500 hover:border-accent/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(212,175,55,0.05)]"
    >
      <Link href={`/${locale}/shop/products/${product.slug}`} className="block">
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

          {/* Quick actions */}
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/${locale}/shop/products/${product.slug}`); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--c-overlay)] backdrop-blur-sm text-text-secondary transition-all duration-300 hover:bg-accent hover:text-text-on-accent"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 p-5">
          {product.brand && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-muted">
              {product.brand}
            </span>
          )}
          <h3 className="text-sm font-semibold text-text line-clamp-1 transition-colors duration-300 group-hover:text-accent">
            {product.name}
          </h3>
          {product.shortDesc && (
            <p className="text-xs text-text-muted line-clamp-1">{product.shortDesc}</p>
          )}

          {product.rating != null && product.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.round(product.rating!)
                        ? "fill-accent text-accent"
                        : "fill-border text-border"
                    }`}
                  />
                ))}
              </div>
              {product.reviewCount != null && (
                <span className="text-[10px] text-text-dim">({product.reviewCount})</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2.5">
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
