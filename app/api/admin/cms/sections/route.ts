import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const DEFAULT_SECTIONS = [
  { id: "hero", type: "hero", title: "Bienvenue chez Tayamo Sport", description: "Votre destination fitness premium à Casablanca", imageUrl: "", videoUrl: "", visible: true, order: 0, settings: { ctaText: "Rejoignez-nous", ctaLink: "/inscription" } },
  { id: "about", type: "about", title: "À propos", description: "Découvrez notre philosophy du sport et du bien-être", imageUrl: "", visible: true, order: 1, settings: {} },
  { id: "activities", type: "activities", title: "Nos Activités", description: "Explorez nos programmes sportifs variés", imageUrl: "", visible: true, order: 2, settings: {} },
  { id: "trainers", type: "trainers", title: "Nos Entraîneurs", description: "Des professionnels certifiés à votre service", imageUrl: "", visible: true, order: 3, settings: {} },
  { id: "testimonials", type: "testimonials", title: "Témoignages", description: "Ce que disent nos membres", imageUrl: "", visible: true, order: 4, settings: {} },
  { id: "gallery", type: "gallery", title: "Galerie", description: "Un aperçu de nos installations", imageUrl: "", visible: true, order: 5, settings: {} },
  { id: "contact", type: "contact", title: "Contactez-nous", description: "Nous sommes là pour vous", imageUrl: "", visible: true, order: 6, settings: {} },
  { id: "cta", type: "cta", title: "Rejoignez Tayamo Sport", description: "Commencez votre parcours fitness aujourd'hui", imageUrl: "", visible: true, order: 7, settings: { ctaText: "S'inscrire", ctaLink: "/inscription" } },
];

const SECTIONS_KEY = "homepage_sections";

async function getSections() {
  const setting = await prisma.setting.findUnique({ where: { key: SECTIONS_KEY } });
  if (setting?.value) {
    try {
      return JSON.parse(setting.value);
    } catch {
      return DEFAULT_SECTIONS;
    }
  }
  return DEFAULT_SECTIONS;
}

async function saveSections(sections: unknown[]) {
  await prisma.setting.upsert({
    where: { key: SECTIONS_KEY },
    update: { value: JSON.stringify(sections) },
    create: { key: SECTIONS_KEY, value: JSON.stringify(sections) },
  });
}

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const sections = await getSections();

    if (!Array.isArray(sections) || sections.length === 0) {
      await saveSections(DEFAULT_SECTIONS);
      return NextResponse.json(DEFAULT_SECTIONS);
    }

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error fetching CMS sections:", error);
    return NextResponse.json(DEFAULT_SECTIONS);
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const sections = await request.json();

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Sections must be an array" }, { status: 400 });
    }

    await saveSections(sections);

    logAudit({ action: "Updated homepage sections", entity: "Setting", details: `Updated ${sections.length} sections` });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving CMS sections:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}
