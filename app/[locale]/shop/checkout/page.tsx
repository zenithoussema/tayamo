"use client";

import { useState, useContext } from "react";
import { ShopCartContext } from "@/components/shop/ShopCartProvider";
import { FadeIn } from "@/components/ui/FadeIn";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const ctx = useContext(ShopCartContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  if (!ctx) return null;
  const { items, getCartTotal, clearCart } = ctx;
  const subtotal = getCartTotal();
  const total = subtotal;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address || !form.city) {
      setError("Please fill in all required fields.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }

      const data = await res.json();
      setOrderId(data.id);
      setSuccess(true);
      clearCart();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-bg pt-28 lg:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <FadeIn>
            <div className="flex flex-col items-center justify-center py-20">
              <CheckCircle className="w-20 h-20 text-green-400 mb-6" />
              <h1
                className="text-2xl md:text-3xl font-bold text-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Order <span className="gold-text">Placed!</span>
              </h1>
              <p className="text-text-muted mb-2">Thank you for your purchase.</p>
              <p className="text-text-muted mb-8">
                Order ID: <span className="gold-text font-mono">{orderId}</span>
              </p>
              <div className="flex gap-4">
                <Link
                  href={`/shop/orders/${orderId}`}
                  className="px-6 py-3 bg-accent text-text-on-accent font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                >
                  View Order
                </Link>
                <Link
                  href="/shop"
                  className="px-6 py-3 border border-border text-text-secondary font-semibold rounded-lg hover:border-accent hover:text-accent transition-colors"
                >
                  Back to Shop
                </Link>
              </div>
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
            <span className="gold-text">Checkout</span>
          </h1>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <FadeIn className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="premium-card p-6 space-y-6">
              <h2
                className="text-xl font-bold text-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Shipping <span className="gold-text">Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="premium-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="premium-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Phone *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="premium-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">City *</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="premium-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-text-muted mb-1 block">Address *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="premium-input w-full"
                />
              </div>

              <div>
                <label className="text-sm text-text-muted mb-1 block">Notes (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="premium-input w-full resize-none"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent text-text-on-accent font-bold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </form>
          </FadeIn>

          {/* Order Summary */}
          <FadeIn delay={0.1}>
            <div className="premium-card p-6 sticky top-28">
              <h2
                className="text-xl font-bold text-text mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Order <span className="gold-text">Summary</span>
              </h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                   <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-text-secondary truncate mr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-text font-medium whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="section-divider w-full mb-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="text-text">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="section-divider w-full" />
                <div className="flex justify-between text-text font-bold text-lg">
                  <span>Total</span>
                  <span className="gold-text">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
