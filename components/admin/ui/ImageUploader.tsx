"use client";

import { useRef, useState, useCallback } from "react";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ui/Toast";

interface ImageUploaderProps {
  currentUrl: string | null;
  onUpload: (url: string) => void;
  onDelete?: () => void;
  label?: string;
  aspectRatio?: "square" | "landscape" | "portrait";
}

const aspectMap = {
  square: "aspect-square",
  landscape: "aspect-video",
  portrait: "aspect-[3/4]",
};

export default function ImageUploader({
  currentUrl,
  onUpload,
  onDelete,
  label,
  aspectRatio = "landscape",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        addToast("Only image files are accepted", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        addToast("File must be under 5MB", "error");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await adminFetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        onUpload(data.url);
        addToast("Image uploaded successfully", "success");
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Upload failed", "error");
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, addToast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--admin-text-muted)]">{label}</label>
      )}

      {currentUrl ? (
        <div
          className={`group relative overflow-hidden rounded-xl border border-[var(--admin-border)] ${aspectMap[aspectRatio]}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="Uploaded"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/40" />
          <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-black/60 p-1.5 text-[var(--admin-text)] backdrop-blur-sm transition-colors hover:bg-[var(--admin-gold)]/80 hover:text-black"
            >
              <Upload size={14} />
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg bg-black/60 p-1.5 text-[var(--admin-text)] backdrop-blur-sm transition-colors hover:bg-[var(--admin-danger)]/80"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          disabled={isUploading}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? "border-[var(--admin-gold)]/60 bg-white/[0.04]"
              : "border-white/10 bg-white/[0.02] hover:border-[var(--admin-gold)]/40 hover:bg-white/[0.04]"
          } ${aspectMap[aspectRatio]} text-[var(--admin-text-dim)]`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--admin-border)] border-t-[var(--admin-gold)]" />
              <span className="text-xs font-medium">Uploading...</span>
            </div>
          ) : (
            <>
              <ImageIcon size={28} className="text-[var(--admin-gold)]/60" />
              <span className="text-xs font-medium">
                Drop an image or click to upload
              </span>
              <span className="text-[10px] text-[var(--admin-text-dim)]">
                JPG, PNG, GIF, WebP up to 5MB
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>
  );
}
