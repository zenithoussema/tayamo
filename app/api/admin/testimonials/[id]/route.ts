import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.authorName !== undefined) data.authorName = body.authorName;
  if (body.content !== undefined) data.content = body.content;
  if (body.rating !== undefined) data.rating = Number(body.rating);
  if (body.approved !== undefined) data.approved = !!body.approved;

  try {
    const testimonial = await prisma.testimonial.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(testimonial);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    await prisma.testimonial.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
