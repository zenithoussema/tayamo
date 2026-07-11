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

  const count = useCountUp(num, 1800, visible);

  return (
    <div
      className="transition-all duration-500"
      style={{
        transitionDelay: visible ? `${index * 100}ms` : "0ms",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
      }}
    >
      <p className="text-lg font-bold text-white">
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
    <section ref={ref} className="bg-primary-dark py-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4">
        {stats.map((stat, i) => (
          <StatItem key={i} text={stat} index={i} visible={visible} />
        ))}
      </div>
    </section>
  );
}
