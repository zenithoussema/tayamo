"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  authorName: string;
  content: string;
  rating: number;
  imageUrl?: string;
}

export function TestimonialCard({
  authorName,
  content,
  rating,
  imageUrl,
}: TestimonialCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="relative rounded-2xl border border-border bg-surface p-7 transition-all duration-500 hover:border-border-accent">
        <Quote className="absolute top-5 right-5 h-8 w-8 text-accent/10" />
        <div className="mb-4 flex items-center gap-4">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={authorName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-border-accent"
            />
          )}
          <div>
            <div className="mb-1 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < rating ? "fill-accent text-accent" : "text-text-dim"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-text">{authorName}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-text-muted">
          &ldquo;{content}&rdquo;
        </p>
      </div>
    </div>
  );
}
