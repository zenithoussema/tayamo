"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
    } else if (res.status === 429) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Trop de tentatives. Veuillez patienter.");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Mot de passe incorrect");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--admin-bg)" }}>
      <form
        onSubmit={handleSubmit}
        className="admin-card flex w-full max-w-sm flex-col gap-4 rounded-xl p-8"
      >
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-white">Administration</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">Veuillez entrer le mot de passe</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoFocus
          className="admin-input"
        />

        {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="admin-btn-gold rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
