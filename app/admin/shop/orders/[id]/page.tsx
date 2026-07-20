"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Link from "next/link";
import { ArrowLeft, Phone, MessageCircle, Package, CheckCircle, Clock, Truck, Ban } from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { id: number; name: string; slug: string; images: string; brand: string };
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  address: string;
  city: string;
  notes: string | null;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "NOUVEAU", label: "Nouveau", icon: Clock, color: "text-[var(--admin-info)]" },
  { value: "EN_COURS", label: "En cours", icon: Package, color: "text-[var(--admin-warning)]" },
  { value: "CONFIRME", label: "Confirmé", icon: CheckCircle, color: "text-[var(--admin-success)]" },
  { value: "LIVRE", label: "Livré", icon: Truck, color: "text-[var(--admin-success)]" },
  { value: "ANNULE", label: "Annulé", icon: Ban, color: "text-[var(--admin-danger)]" },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await adminFetch(`/api/shop/orders/${orderId}`);
      if (res.ok) setOrder(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await adminFetch(`/api/shop/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setOrder(await res.json());
    } catch {
      // ignore
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--admin-text-muted)]">Chargement...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--admin-text-muted)]">Commande introuvable</p>
        <Link href="/admin/shop/orders" className="mt-4 inline-block text-[var(--admin-gold)] hover:underline">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const phoneClean = order.customerPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${phoneClean}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/shop/orders"
          className="rounded-lg p-2 text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">
            Commande <span className="text-[var(--admin-gold)]">#{order.id}</span>
          </h1>
          <p className="text-xs text-[var(--admin-text-muted)]">
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} size="md" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card p-6">
            <h2 className="mb-4 text-lg font-bold text-[var(--admin-text)]">Articles commandés</h2>
            <div className="space-y-3">
              {order.items.map((item) => {
                const images = (() => { try { return JSON.parse(item.product.images); } catch { return []; } })();
                const img = images[0] || "/products/placeholder-whey.svg";
                return (
                  <div key={item.id} className="flex items-center gap-4 rounded-xl border border-[var(--admin-border)] p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={item.product.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[var(--admin-text)]">{item.product.name}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{item.product.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--admin-text)]">{item.price.toFixed(2)} TND</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">x{item.quantity}</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-bold text-[var(--admin-gold)]">{(item.price * item.quantity).toFixed(2)} TND</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-[var(--admin-border)] pt-4 flex justify-between">
              <span className="font-bold text-[var(--admin-text)]">Total</span>
              <span className="text-xl font-bold text-[var(--admin-gold)]">{order.total.toFixed(2)} TND</span>
            </div>
          </div>

          {order.notes && (
            <div className="admin-card p-6">
              <h2 className="mb-2 text-lg font-bold text-[var(--admin-text)]">Notes</h2>
              <p className="text-sm text-[var(--admin-text-muted)]">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="admin-card p-6">
            <h2 className="mb-4 text-lg font-bold text-[var(--admin-text)]">Client</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[var(--admin-text-dim)]">Nom</p>
                <p className="text-sm font-medium text-[var(--admin-text)]">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--admin-text-dim)]">Téléphone</p>
                <p className="text-sm font-medium text-[var(--admin-text)]">{order.customerPhone}</p>
              </div>
              {order.customerEmail && (
                <div>
                  <p className="text-xs text-[var(--admin-text-dim)]">Email</p>
                  <p className="text-sm font-medium text-[var(--admin-text)]">{order.customerEmail}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[var(--admin-text-dim)]">Ville</p>
                <p className="text-sm font-medium text-[var(--admin-text)]">{order.city}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--admin-text-dim)]">Adresse</p>
                <p className="text-sm font-medium text-[var(--admin-text)]">{order.address}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href={`tel:${order.customerPhone}`}
                className="admin-btn flex-1 justify-center gap-2 bg-[var(--admin-info)]/15 text-[var(--admin-info)] border border-[var(--admin-info)]/20 hover:bg-[var(--admin-info)]/25"
              >
                <Phone size={16} />
                Appeler
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn flex-1 justify-center gap-2 bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/25"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="admin-card p-6">
            <h2 className="mb-4 text-lg font-bold text-[var(--admin-text)]">Statut</h2>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.value}
                    onClick={() => updateStatus(s.value)}
                    disabled={updating || order.status === s.value}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                      order.status === s.value
                        ? "bg-[var(--admin-gold)]/10 text-[var(--admin-gold)] border border-[var(--admin-gold)]/20"
                        : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)] border border-transparent"
                    } disabled:cursor-default`}
                  >
                    <Icon size={18} className={order.status === s.value ? s.color : ""} />
                    {s.label}
                    {order.status === s.value && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-[var(--admin-gold)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
