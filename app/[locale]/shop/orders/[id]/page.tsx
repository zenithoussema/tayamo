import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) notFound();

  const order = await prisma.shopOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) notFound();

  const statusColors: Record<string, string> = {
    NOUVEAU: "text-blue-400 bg-blue-400/10",
    EN_COURS: "text-yellow-400 bg-yellow-400/10",
    CONFIRME: "text-green-400 bg-green-400/10",
    LIVRE: "text-green-400 bg-green-400/10",
    ANNULE: "text-red-400 bg-red-400/10",
  };

  const statusLabels: Record<string, string> = {
    NOUVEAU: "Nouveau",
    EN_COURS: "En cours",
    CONFIRME: "Confirmé",
    LIVRE: "Livré",
    ANNULE: "Annulé",
  };

  return (
    <section className="min-h-screen pt-28 pb-20 lg:pt-32 lg:pb-28">
      <div className="max-w-4xl mx-auto px-5 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h1
              className="text-3xl md:text-4xl font-bold text-text mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Order <span className="gold-text">Confirmed</span>
            </h1>
            <p className="text-text-muted">
              Order ID: <span className="font-mono text-text">{order.id}</span>
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
            <h2
              className="text-lg font-bold text-text mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Order <span className="gold-text">Details</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Name</span>
                  <span className="text-text">{order.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Email</span>
                  <span className="text-text">{order.customerEmail || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Phone</span>
                  <span className="text-text">{order.customerPhone}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">City</span>
                  <span className="text-text">{order.city}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Address</span>
                  <span className="text-text text-right max-w-[200px]">{order.address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "text-text-muted bg-surface-elevated"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
            <h2
              className="text-lg font-bold text-text mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Items <span className="gold-text">Ordered</span>
            </h2>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-muted bg-surface-elevated">Product</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-text-muted bg-surface-elevated">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-muted bg-surface-elevated">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-muted bg-surface-elevated">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-sm text-text">{item.product?.name || "Deleted product"}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">{item.price.toFixed(2)} TND</td>
                      <td className="px-4 py-3 text-sm gold-text text-right font-medium">
                        {(item.price * item.quantity).toFixed(2)} TND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="rounded-2xl border border-border bg-surface p-6 mb-8">
            <div className="space-y-2">
              <div className="flex justify-between text-text-muted">
                <span>Total</span>
                <span className="gold-text font-bold text-xl">{order.total.toFixed(2)} TND</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {order.notes && (
          <FadeIn delay={0.25}>
            <div className="rounded-2xl border border-border bg-surface p-6 mb-8">
              <h3
                className="text-sm font-medium text-text-muted mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Notes
              </h3>
              <p className="text-text-secondary text-sm">{order.notes}</p>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.3}>
          <div className="text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border-accent text-accent rounded-xl hover:bg-accent-dim transition-colors font-bold text-sm uppercase tracking-wider"
            >
              Continue Shopping
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
