"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import Link from "next/link";
import { Package, Search, ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { id: number; name: string; slug: string; images: string };
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
  items: OrderItem[];
}

const STATUS_OPTIONS = [
  { key: "ALL", label: "Toutes" },
  { key: "NOUVEAU", label: "Nouveau" },
  { key: "EN_COURS", label: "En cours" },
  { key: "CONFIRME", label: "Confirmé" },
  { key: "LIVRE", label: "Livré" },
  { key: "ANNULE", label: "Annulé" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await adminFetch(`/api/shop/orders?${params}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data);
        setTotal(json.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const deleteOrder = async (id: number) => {
    if (!confirm("Supprimer cette commande ?")) return;
    const res = await adminFetch(`/api/shop/orders/${id}`, { method: "DELETE" });
    if (res.ok) fetchOrders();
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      String(o.id).includes(q)
    );
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={24} className="text-[var(--admin-gold)]" />
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Commandes</h1>
          <span className="rounded-full bg-[var(--admin-info)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--admin-info)]">
            {total}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-dim)]" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, #ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => { setStatusFilter(s.key); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s.key
                  ? "bg-[var(--admin-gold)]/15 text-[var(--admin-gold)]"
                  : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Date</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--admin-text-muted)]">
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--admin-text-muted)]">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-[var(--admin-text-muted)]">#{order.id}</td>
                    <td className="font-medium text-[var(--admin-text)]">{order.customerName}</td>
                    <td className="text-[var(--admin-text-muted)]">{order.customerPhone}</td>
                    <td className="text-[var(--admin-text-muted)]">{order.city}</td>
                    <td className="text-[var(--admin-text-muted)]">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} article(s)
                    </td>
                    <td className="font-bold text-[var(--admin-gold)]">{order.total.toFixed(2)} TND</td>
                    <td className="text-xs text-[var(--admin-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/shop/orders/${order.id}`}
                          className="rounded-lg p-1.5 text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)] transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="rounded-lg p-1.5 text-[var(--admin-text-muted)] hover:bg-[var(--admin-danger)]/10 hover:text-[var(--admin-danger)] transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--admin-text-muted)]">
            Page {page} sur {totalPages} ({total} commandes)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="admin-btn-ghost disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="admin-btn-ghost disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
