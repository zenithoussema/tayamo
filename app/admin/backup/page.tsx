"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Database, Download, Upload, Shield, Users, CreditCard,
  UserCheck, Calendar, Activity, FileText, Bell, MessageSquare,
  Image as ImageIcon, CheckCircle, AlertTriangle,
} from "lucide-react";

import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { StatSkeleton } from "@/components/admin/ui/Skeleton";

interface BackupMeta {
  version: string;
  createdAt: string;
  data: Record<string, Array<Record<string, unknown>>>;
}

export default function BackupPage() {
  const { addToast } = useToast();
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [dbStats, setDbStats] = useState<Record<string, number> | null>(null);
  const [backingUp, setBackingUp] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backupMeta, setBackupMeta] = useState<BackupMeta | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/stats");
      if (!res.ok) throw new Error("Erreur");
      const json = await res.json();
      const s = json.stats || json;
      setDbStats({
        clients: s.totalClients ?? 0,
        payments: s.totalPayments ?? 0,
        attendances: s.todayAttendances ?? 0,
        bookings: s.totalBookings ?? 0,
        coaches: s.totalCoaches ?? 0,
        activities: s.totalActivities ?? 0,
        plans: s.totalPlans ?? 0,
        messages: s.totalMessages ?? 0,
        gallery: s.totalGalleryImages ?? 0,
        notifications: s.unreadNotifications ?? 0,
      });
    } catch {
      // fallback counts
    }
  }, []);

  const fetchLastBackup = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/audit?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      const entry = data.data?.find((e: { action: string; createdAt: string }) => e.action === "Database backup created");
      if (entry) setLastBackup(entry.createdAt);
    } catch {}
  }, []);

  useEffect(() => { (async () => { await fetchStats(); await fetchLastBackup(); })(); }, [fetchStats, fetchLastBackup]);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await adminFetch("/api/admin/backup");
      if (!res.ok) throw new Error("Erreur");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tayamo-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLastBackup(new Date().toISOString());
      addToast("Sauvegarde créée avec succès", "success");
    } catch {
      addToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setBackingUp(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setBackupMeta(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.version && parsed.data) {
        setBackupMeta(parsed);
      } else {
        addToast("Fichier de sauvegarde invalide", "error");
        setSelectedFile(null);
      }
    } catch {
      addToast("Fichier JSON invalide", "error");
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".json")) handleFileSelect(file);
    else addToast("Veuillez sélectionner un fichier JSON", "error");
  };

  const handleRestore = async () => {
    if (!backupMeta) return;
    setRestoring(true);
    setConfirmOpen(false);
    try {
      const res = await adminFetch("/api/admin/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupMeta),
      });
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      const total = Object.values(data.counts as Record<string, number>).reduce((a, b) => a + b, 0);
      addToast(`${total} enregistrements restaurés avec succès`, "success");
      setSelectedFile(null);
      setBackupMeta(null);
      fetchStats();
    } catch {
      addToast("Erreur lors de la restauration", "error");
    } finally {
      setRestoring(false);
    }
  };

  const statItems = [
    { label: "Membres", count: dbStats?.clients ?? 0, icon: <Users size={18} />, color: "text-[var(--admin-gold)]" },
    { label: "Paiements", count: dbStats?.payments ?? 0, icon: <CreditCard size={18} />, color: "text-[var(--admin-success)]" },
    { label: "Présences", count: dbStats?.attendances ?? 0, icon: <CheckCircle size={18} />, color: "text-[var(--admin-info)]" },
    { label: "Réservations", count: dbStats?.bookings ?? 0, icon: <Calendar size={18} />, color: "text-[var(--admin-warning)]" },
    { label: "Entraîneurs", count: dbStats?.coaches ?? 0, icon: <UserCheck size={18} />, color: "text-[var(--admin-gold)]" },
    { label: "Activités", count: dbStats?.activities ?? 0, icon: <Activity size={18} />, color: "text-[var(--admin-success)]" },
    { label: "Plans", count: dbStats?.plans ?? 0, icon: <FileText size={18} />, color: "text-[var(--admin-info)]" },
    { label: "Messages", count: dbStats?.messages ?? 0, icon: <MessageSquare size={18} />, color: "text-[var(--admin-warning)]" },
    { label: "Galerie", count: dbStats?.gallery ?? 0, icon: <ImageIcon size={18} />, color: "text-[var(--admin-gold)]" },
    { label: "Notifications", count: dbStats?.notifications ?? 0, icon: <Bell size={18} />, color: "text-[var(--admin-success)]" },
  ];

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sauvegarde & Restauration</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">Gérez les sauvegardes de votre base de données</p>
        </div>
      </div>

      {/* Status */}
      <div className="admin-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--admin-gold)]/15">
              <Shield size={24} className="text-[var(--admin-gold)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--admin-text-muted)]">Dernière sauvegarde</p>
              <p className="text-lg font-bold text-white">
                {lastBackup ? new Date(lastBackup).toLocaleString("fr-FR") : "Aucune sauvegarde"}
              </p>
            </div>
          </div>
          <button onClick={handleBackup} disabled={backingUp} className="admin-btn admin-btn-gold">
            <Download size={16} className={backingUp ? "animate-bounce" : ""} />
            {backingUp ? "Sauvegarde..." : "Sauvegarder maintenant"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Backup Section */}
        <div className="admin-card rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Download size={20} className="text-[var(--admin-gold)]" />
            Créer une sauvegarde
          </h2>
          <p className="mb-4 text-sm text-[var(--admin-text-muted)]">
            Exportez toutes les données de la base de données dans un fichier JSON sécurisé.
          </p>
          <button onClick={handleBackup} disabled={backingUp} className="w-full admin-btn admin-btn-gold justify-center">
            {backingUp ? (
              <><span className="animate-spin">⟳</span> Sauvegarde en cours...</>
            ) : (
              <><Download size={16} /> Télécharger la sauvegarde</>
            )}
          </button>
        </div>

        {/* Restore Section */}
        <div className="admin-card rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Upload size={20} className="text-[var(--admin-info)]" />
            Restaurer une sauvegarde
          </h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
              dragOver
                ? "border-[var(--admin-gold)] bg-[var(--admin-gold)]/10"
                : "border-[var(--admin-border)] hover:border-[var(--admin-text-dim)] hover:bg-white/[0.02]"
            }`}
          >
            <Upload size={32} className={`mb-3 ${dragOver ? "text-[var(--admin-gold)]" : "text-[var(--admin-text-dim)]"}`} />
            {selectedFile ? (
              <div className="text-center">
                <p className="font-medium text-white">{selectedFile.name}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--admin-text-muted)]">Glissez un fichier JSON ici</p>
                <p className="mt-1 text-xs text-[var(--admin-text-dim)]">ou cliquez pour sélectionner</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          </div>

          {backupMeta && (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-semibold text-[var(--admin-text)]">Aperçu de la sauvegarde</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(backupMeta.data).map(([table, records]) => (
                  <div key={table} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                    <span className="text-[var(--admin-text-muted)]">{table}</span>
                    <span className="font-medium text-[var(--admin-gold)]">{Array.isArray(records) ? records.length : 0}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                <span className="text-[var(--admin-text-muted)]">Version</span>
                <span className="font-medium text-[var(--admin-text)]">{backupMeta.version}</span>
              </div>
              <button onClick={() => setConfirmOpen(true)} disabled={restoring} className="w-full admin-btn admin-btn-danger justify-center">
                <AlertTriangle size={16} />
                {restoring ? "Restauration..." : "Restaurer cette sauvegarde"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Database Statistics */}
      <div className="admin-card rounded-2xl p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Database size={20} className="text-[var(--admin-gold)]" />
          Statistiques de la base de données
        </h2>
        {!dbStats ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => <StatSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {statItems.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/[0.03] p-4 text-center">
                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] ${s.color}`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-bold text-white">{s.count.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRestore}
        title="Êtes-vous sûr ?"
        message="Cette action remplacera toutes les données actuelles par celles de la sauvegarde. Cette opération est irréversible."
        confirmLabel={restoring ? "Restauration..." : "Restaurer"}
        loading={restoring}
      />
    </div>
  );
}
