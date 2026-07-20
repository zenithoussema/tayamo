import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { sortOrder: "asc" },
    });

    const parsed = images.map((img) => {
      let alt = img.alt;
      let category = "Général";
      let featured = false;
      let type = "image";
      let videoUrl = "";
      try {
        const meta = JSON.parse(img.alt);
        if (typeof meta === "object" && meta !== null) {
          alt = meta.alt || alt;
          category = meta.category || "Général";
          featured = meta.featured ?? false;
          type = meta.type || "image";
          videoUrl = meta.videoUrl || "";
        }
      } catch {}
      return { id: img.id, url: img.url, alt, category, featured, sortOrder: img.sortOrder, type, videoUrl };
    });

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}
