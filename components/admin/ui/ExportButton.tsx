"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

interface ExportButtonProps {
  endpoint: string;
  filename?: string;
  label?: string;
}

export default function ExportButton({
  endpoint,
  filename = "export.csv",
  label = "Exporter",
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(endpoint);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="admin-btn admin-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {label}
    </button>
  );
}
