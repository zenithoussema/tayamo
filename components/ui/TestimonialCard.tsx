"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "./Card";
import { Star } from "lucide-react";

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
      <Card className="p-6">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={authorName}
            className="mb-3 h-12 w-12 rounded-full object-cover"
          />
        )}
        <div className="mb-3 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "fill-accent text-accent" : "text-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          &ldquo;{content}&rdquo;
        </p>
        <p className="text-sm font-semibold text-primary-dark">{authorName}</p>
      </Card>
    </div>
  );
}
