"use client";

import { useState, useContext } from "react";
import { ShopCartContext } from "@/components/shop/ShopCartProvider";
import { FadeIn } from "@/components/ui/FadeIn";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const ctx = useContext(ShopCartContext);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  if (!ctx) return null;

  const { items, removeItem, updateQuantity, getCartTotal } = ctx;
  const subtotal = getCartTotal();
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  function handleApplyCoupon() {
    if (coupon.trim().toUpperCase() === "TAYAMO10") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponApplied(false);
      setCouponError("Invalid coupon code");
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-bg pt-28 lg:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <FadeIn>
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingBag className="w-20 h-20 text-text-dim mb-6" />
              <h1
                className="text-2xl md:text-3xl font-bold text-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Your Cart is <span className="gold-text">Empty</span>
              </h1>
              <p className="text-text-muted mb-8">Start adding items to your cart.</p>
              <Link
                href="/shop/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-text-on-accent font-semibold rounded-lg hover:bg-accent-hover transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Browse Products
              </Link>
            </div>
          </FadeIn>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg pt-28 lg:pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <FadeIn>
          <h1
            className="text-3xl md:text-4xl font-bold text-text mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Shopping <span className="gold-text">Cart</span>
          </h1>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <FadeIn key={item.id} delay={i * 0.05}>
                <div className="premium-card p-4 flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                    {(() => {
                      try {
                        const imgs = item.images ? JSON.parse(item.images) : [];
                        const img = imgs[0];
                        return img ? (
                          <Image src={img} alt={item.name} fill className="object-cover" />
                        ) : null;
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-text font-medium truncate">{item.name}</h3>
                    <p className="gold-text font-bold">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-text">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-text font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Order Summary */}
          <FadeIn delay={0.1}>
            <div className="premium-card p-6 sticky top-28">
              <h2
                className="text-xl font-bold text-text mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Order <span className="gold-text">Summary</span>
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="text-text">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-text-muted">
                    <span>Coupon Discount (10%)</span>
                    <span className="text-green-400">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="section-divider w-full" />
                <div className="flex justify-between text-text font-bold text-lg">
                  <span>Total</span>
                  <span className="gold-text">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="text-sm text-text-muted mb-2 block">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                    placeholder="Enter code"
                    className="premium-input flex-1"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 border border-accent text-accent rounded-lg text-sm font-medium hover:bg-accent-dim transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
                {couponApplied && <p className="text-green-400 text-xs mt-1">Coupon applied!</p>}
              </div>

              <Link href="/shop/checkout" className="block">
                <button className="w-full py-3 bg-accent text-text-on-accent font-bold rounded-lg hover:bg-accent-hover transition-colors">
                  Proceed to Checkout
                </button>
              </Link>

              <Link
                href="/shop/products"
                className="block text-center mt-4 text-text-muted hover:text-accent text-sm transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
