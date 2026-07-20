import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await prisma.shopOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: true, brand: true } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const body = await request.json();
  const { status } = body;

  const validStatuses = ["NOUVEAU", "EN_COURS", "CONFIRME", "LIVRE", "ANNULE"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.shopOrder.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: true, brand: true } },
        },
      },
    },
  });

  return NextResponse.json(order);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await prisma.shopOrder.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.shopOrder.delete({ where: { id: orderId } });
  return NextResponse.json({ success: true });
}
