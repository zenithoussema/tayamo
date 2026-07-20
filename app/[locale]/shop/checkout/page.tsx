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
    if (!form.name || !form.phone || !form.address || !form.city) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (items.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email || undefined,
          customerPhone: form.phone,
          address: form.address,
          city: form.city,
          notes: form.notes || undefined,
          items: items.map((item) => ({
            productId: parseInt(item.id, 10),
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
              <CheckCircle className="w-20 h-20 text-success mb-6" />
              <h1
                className="text-2xl md:text-3xl font-bold text-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Commande <span className="gold-text">envoyée !</span>
              </h1>
              <p className="text-text-muted mb-2">
                Votre commande a bien été enregistrée.
              </p>
              <p className="text-text-muted mb-2">
                Nous vous contacterons bientôt pour confirmer la livraison.
              </p>
              <p className="text-text-muted mb-8">
                N° de commande : <span className="gold-text font-mono">#{orderId}</span>
              </p>
              <div className="flex gap-4">
                <Link
                  href={`/shop/orders/${orderId}`}
                  className="px-6 py-3 bg-accent text-text-on-accent font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Voir ma commande
                </Link>
                <Link
                  href="/shop/products"
                  className="px-6 py-3 border border-border text-text-secondary font-semibold rounded-lg hover:border-accent hover:text-accent transition-colors"
                >
                  Continuer les achats
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
                Informations de <span className="gold-text">livraison</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Nom complet *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="premium-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="premium-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Téléphone *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="premium-input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Wilaya / Ville *</label>
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
                <label className="text-sm text-text-muted mb-1 block">Adresse complète *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="premium-input w-full"
                />
              </div>

              <div>
                <label className="text-sm text-text-muted mb-1 block">Notes (optionnel)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="premium-input w-full resize-none"
                />
              </div>

              {error && <p className="text-error text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent text-text-on-accent font-bold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer la commande"
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
                Récapitulatif de <span className="gold-text">la commande</span>
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
                  <span>Sous-total</span>
                  <span className="text-text">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Livraison</span>
                  <span className="text-success">Gratuite</span>
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
