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
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <h2
            className="mb-4 text-center text-3xl font-extrabold text-primary-dark md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Notre Galerie
          </h2>
          <p className="mb-10 text-center text-gray-600">
            Un aperçu de notre univers sportif
          </p>
        </FadeIn>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {images.map((img, i) => (
            <FadeIn key={img.id} delay={i * 80}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-400 group-hover:scale-108"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-opacity duration-300 group-hover:bg-black/30" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
