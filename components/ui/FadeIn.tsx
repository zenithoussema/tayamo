"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "scale";
}

export function FadeIn({ children, delay = 0, className = "", direction = "up" }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translate(0, 0) scale(1)";
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const transforms: Record<string, string> = {
    up: "translateY(40px)",
    down: "translateY(-30px)",
    left: "translateX(40px)",
    right: "translateX(-40px)",
    scale: "scale(0.92)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: transforms[direction],
        transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}
