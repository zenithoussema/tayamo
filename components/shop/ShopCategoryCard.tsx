"use client";

import { useState } from "react";
import Link from "next/link";

interface ShopCategory {
  name: string;
  slug: string;
  icon?: string | null;
  imageUrl?: string | null;
  productCount?: number;
}

interface ShopCategoryCardProps {
  category: ShopCategory;
  locale?: string;
}

export function ShopCategoryCard({ category, locale = "fr" }: ShopCategoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/${locale}/shop/products?category=${category.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-surface border border-border transition-all duration-500 hover:border-accent/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(212,175,55,0.08)] hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {category.imageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-surface-elevated animate-[shimmer_2s_infinite]" />
            )}
            <img
              src={category.imageUrl}
              alt={category.name}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent-dim to-transparent">
            {category.icon ? (
              <span className="text-4xl">{category.icon}</span>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-dim border border-accent/20">
                <span className="text-2xl font-bold text-accent">{category.name[0]}</span>
              </div>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-base font-bold text-text transition-colors duration-300 group-hover:text-accent">
          {category.name}
        </h3>
        {category.productCount != null && (
          <p className="mt-1 text-xs text-text-muted">
            {category.productCount} {category.productCount === 1 ? "product" : "products"}
          </p>
        )}
      </div>
    </Link>
  );
}
