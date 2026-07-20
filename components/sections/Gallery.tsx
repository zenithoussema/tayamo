import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";

interface GalleryImageProps {
  id: number;
  url: string;
  alt: string;
}

interface GalleryProps {
  images: GalleryImageProps[];
}

export function Gallery({ images }: GalleryProps) {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <FadeIn>
          <div className="mb-12 text-center">
            <h2
              className="mb-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Notre <span className="gold-text">Galerie</span>
            </h2>
            <p className="mx-auto max-w-lg text-text-muted">
              Un aperçu de notre univers sportif
            </p>
            <div className="section-divider mx-auto mt-6 w-24" />
          </div>
        </FadeIn>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {images.map((img, i) => (
            <FadeIn key={img.id} delay={i * 80}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--c-overlay)] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
