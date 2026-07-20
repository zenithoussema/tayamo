"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      if (current !== start) {
        start = current;
        setValue(current);
      }
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [trigger, target, duration]);

  return value;
}

function StatItem({
  text,
  index,
  visible,
}: {
  text: string;
  index: number;
  visible: boolean;
}) {
  const match = text.match(/^(\+?)(\d+)(.*)/);
  const isNumeric = !!match;
  const prefix = match?.[1] ?? "";
  const num = match ? parseInt(match[2], 10) : 0;
  const suffix = match?.[3] ?? "";

  const count = useCountUp(num, 2000, visible);

  return (
    <div
      className="text-center transition-all duration-700"
      style={{
        transitionDelay: visible ? `${index * 150}ms` : "0ms",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <p className="text-2xl font-bold tracking-tight text-text lg:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        {isNumeric ? `${prefix}${count}${suffix}` : text}
      </p>
    </div>
  );
}

export function StatsBar({ stats }: { stats: string[] }) {
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
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative border-y border-border bg-bg py-12 lg:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 text-center lg:grid-cols-4 lg:px-8">
        {stats.map((stat, i) => (
          <StatItem key={i} text={stat} index={i} visible={visible} />
        ))}
      </div>
    </section>
  );
}
