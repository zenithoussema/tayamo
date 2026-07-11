import Image from "next/image";
import { prisma } from "@/lib/db";
import { FadeIn } from "@/components/ui/FadeIn";

interface GalleryMeta {
  url: string;
  alt: string;
  category: string;
  featured: boolean;
}

function parseImageMeta(altField: string): { alt: string; category: string; featured: boolean } {
  try {
    const parsed = JSON.parse(altField);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        alt: parsed.alt ?? "",
        category: parsed.category ?? "Général",
        featured: parsed.featured ?? false,
      };
    }
  } catch {}
  return { alt: altField, category: "Général", featured: false };
}

export default async function GalleryPage() {
  const rawImages = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const images: GalleryMeta[] = rawImages.map((img) => {
    const meta = parseImageMeta(img.alt);
    return {
      url: img.url,
      alt: meta.alt || "Tayamo Sport — Galerie",
      category: meta.category,
      featured: meta.featured,
    };
  });

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn>
          <h1
            className="mb-4 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Notre Galerie
          </h1>
          <p className="mb-10 text-center text-gray-600">
            Un aperçu de notre univers sportif
          </p>
        </FadeIn>

        {images.length === 0 ? (
          <FadeIn>
            <div className="rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
              <p className="text-gray-500">Aucune image disponible pour le moment.</p>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {images.map((img, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="group relative aspect-[4/5] overflow-hidden rounded-xl">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-400 group-hover:scale-108"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-opacity duration-300 group-hover:bg-black/30" />
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
