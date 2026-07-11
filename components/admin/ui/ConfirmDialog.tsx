"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Supprimer",
  loading,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="admin-glass admin-animate-scale-in w-full max-w-md rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-danger)]/15">
          <AlertTriangle size={24} className="text-[var(--admin-danger)]" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-[var(--admin-text)]">{title}</h3>
        <p className="mb-6 text-sm text-[var(--admin-text-muted)]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="admin-btn admin-btn-ghost"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="admin-btn admin-btn-danger"
          >
            {loading ? "Suppression..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
