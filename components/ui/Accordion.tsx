"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border-strong bg-surface overflow-hidden transition-all duration-300"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold text-text transition-colors hover:bg-white/[0.02]"
          >
            <span className="pr-4 text-[15px]">{item.title}</span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-accent transition-transform duration-300 ${
                openIndex === i ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === i ? "max-h-96" : "max-h-0"
            }`}
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
