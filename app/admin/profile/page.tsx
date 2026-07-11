"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { User, Lock, Save, Shield } from "lucide-react";
import { FormSkeleton } from "@/components/admin/ui/Skeleton";
import { useToast } from "@/components/admin/ui/Toast";

export default function ProfilePage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState({ username: "", role: "", gymName: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/profile");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setProfile(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setProfile({ username: "", role: "", gymName: "" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => { await fetchProfile(); })();
  }, []);

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      addToast("Veuillez remplir tous les champs", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast("Les mots de passe ne correspondent pas", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addToast("Le mot de passe doit contenir au moins 6 caractères", "error");
      return;
    }

    setSaving(true);
    const res = await adminFetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      addToast(data.message || "Mot de passe mis à jour", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      addToast(data.error || "Erreur lors de la mise à jour", "error");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="admin-animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profil administrateur</h1>
        <p className="text-sm text-[var(--admin-text-muted)]">Gérez votre profil et vos paramètres de sécurité</p>
      </div>
      <FormSkeleton />
    </div>
  );

  if (error) return (
    <div className="admin-animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-white">Profil administrateur</h1>
      <div className="admin-card rounded-xl p-6 text-center">
        <p className="text-sm text-[var(--admin-danger)]">{error}</p>
        <button onClick={fetchProfile} className="mt-3 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/20 transition-colors">Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Profil administrateur</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">Gérez votre profil et vos paramètres de sécurité</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--admin-gold)]/10 text-[var(--admin-gold)]">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Informations du compte</h2>
              <p className="text-sm text-[var(--admin-text-muted)]">Détails de votre compte administrateur</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-white/[0.03] p-4">
              <p className="text-xs font-medium text-[var(--admin-text-dim)]">Nom d&apos;utilisateur</p>
              <p className="text-sm font-medium text-white">{profile.username}</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-4">
              <p className="text-xs font-medium text-[var(--admin-text-dim)]">Rôle</p>
              <p className="text-sm font-medium text-white">{profile.role}</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-4">
              <p className="text-xs font-medium text-[var(--admin-text-dim)]">Salle</p>
              <p className="text-sm font-medium text-white">{profile.gymName}</p>
            </div>
          </div>
        </div>

        <div className="admin-card rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--admin-danger)]/10 text-[var(--admin-danger)]">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Changer le mot de passe</h2>
              <p className="text-sm text-[var(--admin-text-muted)]">Mettez à jour votre mot de passe</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Mot de passe actuel</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Nouveau mot de passe</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">Confirmer le mot de passe</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="admin-input w-full"
              />
            </div>
            <div className="rounded-lg bg-[var(--admin-warning)]/10 p-3">
              <div className="flex items-start gap-2">
                <Shield size={14} className="mt-0.5 text-[var(--admin-warning)]" />
                <p className="text-xs text-[var(--admin-warning)]">
                  Le changement de mot de passe nécessite une mise à jour de la variable d&apos;environnement <code>ADMIN_PASSWORD</code> dans le fichier <code>.env</code>.
                </p>
              </div>
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={saving}
              className="admin-btn-gold flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "Enregistrement..." : "Changer le mot de passe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
