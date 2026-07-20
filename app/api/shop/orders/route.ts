import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") where.status = status;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
      { id: isNaN(parseInt(search)) ? -1 : parseInt(search) },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.shopOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: true } },
          },
        },
      },
    }),
    prisma.shopOrder.count({ where }),
  ]);

  return NextResponse.json({ data, total });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerName, customerEmail, customerPhone, address, city, notes, items } = body;

  const missing: string[] = [];
  if (!customerName) missing.push("Nom complet");
  if (!customerPhone) missing.push("Téléphone");
  if (!address) missing.push("Adresse");
  if (!city) missing.push("Ville");
  if (!items?.length) missing.push("Articles du panier");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Champs manquants : ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const productIds = items.map((item: { productId: number }) => item.productId);
  const products = await prisma.shopProduct.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 });
  }

  let total = 0;
  const orderItems = items.map((item: { productId: number; quantity: number }) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const lineTotal = product.price * item.quantity;
    total += lineTotal;
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    };
  });

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.shopOrder.create({
      data: {
        customerName,
        customerEmail: customerEmail || null,
        customerPhone,
        address,
        city,
        notes: notes || null,
        total,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    for (const item of orderItems) {
      await tx.shopProduct.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return NextResponse.json(order, { status: 201 });
}
