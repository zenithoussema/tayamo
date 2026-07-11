import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const SECTIONS_KEY = "homepage_sections";

interface CmsSection {
  id: string;
  type: string;
  [key: string]: unknown;
}

async function getSections() {
  const setting = await prisma.setting.findUnique({ where: { key: SECTIONS_KEY } });
  if (setting?.value) {
    try {
      return JSON.parse(setting.value) as CmsSection[];
    } catch {
      return [];
    }
  }
  return [];
}

async function saveSections(sections: CmsSection[]) {
  await prisma.setting.upsert({
    where: { key: SECTIONS_KEY },
    update: { value: JSON.stringify(sections) },
    create: { key: SECTIONS_KEY, value: JSON.stringify(sections) },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const sections = await getSections();
    const section = sections.find((s: CmsSection) => s.id === id);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error fetching CMS section:", error);
    return NextResponse.json({ error: "Erreur lors du chargement" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const sections = await getSections();
    const index = sections.findIndex((s: CmsSection) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    sections[index] = { ...sections[index], ...body };

    await saveSections(sections);

    logAudit({ action: `Updated section: ${id}`, entity: "Setting", details: `Updated section ${id}` });

    return NextResponse.json(sections[index]);
  } catch (error) {
    console.error("Error updating CMS section:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const sections = await getSections();
    const index = sections.findIndex((s: CmsSection) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const updated = sections.filter((s: CmsSection) => s.id !== id);
    await saveSections(updated);

    logAudit({ action: `Deleted section: ${id}`, entity: "Setting", details: `Deleted section ${id}` });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting CMS section:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
