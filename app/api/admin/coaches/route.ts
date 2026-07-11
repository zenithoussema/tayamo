import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, parsePagination, parseSearch } from "@/lib/admin-auth";
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

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { page, limit, skip } = parsePagination(request);
  const search = parseSearch(request);

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { specialty: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [coaches, total] = await Promise.all([
    prisma.coach.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { schedules: true } },
      },
    }),
    prisma.coach.count({ where }),
  ]);

  const enriched = coaches.map((c) => {
    const bioData = parseCoachBio(c.bio);
    return {
      ...c,
      bio: bioData.bio ?? "",
      experience: bioData.experience ?? 0,
      certifications: bioData.certifications ?? "",
      social: bioData.social ?? {},
    };
  });

  return NextResponse.json({ data: enriched, total, page, limit });
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { name, specialty, imageUrl, bio, experience, certifications, social, isActive } = body;

  if (!name || !specialty) {
    return NextResponse.json({ error: "Name and specialty are required" }, { status: 400 });
  }

  const bioJson = serializeCoachBio({ bio, experience, certifications, social });

  const coach = await prisma.coach.create({
    data: {
      name,
      specialty,
      imageUrl: imageUrl || null,
      bio: bioJson,
      isActive: isActive !== false,
    },
  });

  logAudit({ action: "Created coach", entity: "Coach", entityId: coach.id, details: `Created coach: ${name}` });

  return NextResponse.json(coach, { status: 201 });
}
