import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { phone } = body;

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const client = await prisma.client.findFirst({
    where: { phone: { equals: phone, mode: "insensitive" } },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const attendance = await prisma.attendance.create({
    data: {
      clientId: client.id,
      method: "PHONE_SEARCH",
    },
  });

  return NextResponse.json({ attendance, client }, { status: 201 });
}
