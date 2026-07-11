import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

interface CoachBioData {
  bio?: string;
  experience?: number;
  certifications?: string;
  social?: { facebook?: string; instagram?: string; tiktok?: string };
}

function parseCoachBio(bioField: string | null): CoachBioData {
  if (!bioField) return {};
  try {
    const parsed = JSON.parse(bioField);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        bio: parsed.bio ?? "",
        experience: parsed.experience ?? 0,
        certifications: parsed.certifications ?? "",
        social: parsed.social ?? {},
      };
    }
  } catch {}
  return { bio: bioField };
}

function serializeCoachBio(data: CoachBioData): string {
  return JSON.stringify({
    bio: data.bio ?? "",
    experience: data.experience ?? 0,
    certifications: data.certifications ?? "",
    social: data.social ?? {},
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const coach = await prisma.coach.findUnique({
    where: { id: Number(id) },
    include: {
      schedules: {
        include: { activity: { select: { nameFr: true, nameAr: true, slug: true } } },
      },
    },
  });

  if (!coach) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bioData = parseCoachBio(coach.bio);

  return NextResponse.json({
    ...coach,
    bio: bioData.bio ?? "",
    experience: bioData.experience ?? 0,
    certifications: bioData.certifications ?? "",
    social: bioData.social ?? {},
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.specialty !== undefined) data.specialty = body.specialty;
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  if (body.bio !== undefined || body.experience !== undefined || body.certifications !== undefined || body.social !== undefined) {
    let existingBio: CoachBioData = {};
    try {
      const existing = await prisma.coach.findUnique({ where: { id: Number(id) }, select: { bio: true } });
      if (existing) existingBio = parseCoachBio(existing.bio);
    } catch {}

    if (body.bio !== undefined) existingBio.bio = body.bio;
    if (body.experience !== undefined) existingBio.experience = body.experience;
    if (body.certifications !== undefined) existingBio.certifications = body.certifications;
    if (body.social !== undefined) existingBio.social = body.social;

    data.bio = serializeCoachBio(existingBio);
  }

  try {
    const coach = await prisma.coach.update({
      where: { id: Number(id) },
      data,
    });
    logAudit({ action: "Updated coach", entity: "Coach", entityId: Number(id), details: `Updated coach: ${id}` });
    return NextResponse.json(coach);
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
    await prisma.coach.delete({ where: { id: Number(id) } });
    logAudit({ action: "Deleted coach", entity: "Coach", entityId: Number(id), details: `Deleted coach: ${id}` });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
