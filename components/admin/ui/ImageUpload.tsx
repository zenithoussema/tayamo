"use client";

import { useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-[var(--admin-text-muted)]">{label}</label>}
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-[var(--admin-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Upload" className="h-40 w-full object-cover" />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/30" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-[var(--admin-text)] opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-[var(--admin-danger)]/80"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-dim)] transition-all duration-200 hover:border-[var(--admin-gold)]/40 hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text-muted)]"
        >
          <ImageIcon size={24} />
          <span className="text-xs font-medium">Cliquez pour uploader</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ou collez une URL d'image..."
        className="admin-input mt-2"
      />
    </div>
  );
}
