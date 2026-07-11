import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const clientId = Number(id);

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payments = await prisma.payment.findMany({
    where: { clientId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(payments);
}
