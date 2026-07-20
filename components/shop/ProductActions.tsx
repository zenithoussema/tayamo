"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShopCart } from "@/components/shop/ShopCartProvider";
import { ShoppingCart, Zap, Minus, Plus } from "lucide-react";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string;
    stock: number;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useShopCart();
  const router = useRouter();

  function handleAddToCart() {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,
      quantity,
    });
  }

  function handleBuyNow() {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,
      quantity,
    });
    router.push("/shop/cart");
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-text-muted mb-2 block">Quantity</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-border bg-surface-elevated">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-10 w-10 items-center justify-center text-text-secondary transition-colors hover:text-text"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium text-text">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="flex h-10 w-10 items-center justify-center text-text-secondary transition-colors hover:text-text"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-text-dim">{product.stock} in stock</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-text-on-accent transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-accent/40 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-accent transition-all duration-300 hover:bg-accent-dim hover:border-accent"
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </button>
      </div>
    </div>
  );
}
