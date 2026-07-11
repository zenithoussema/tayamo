"use client";

import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Building2,
  Phone,
  Share2,
  Clock,
  Globe,
  Layout,
  Save,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/admin/ui/Toast";
import { StatSkeleton } from "@/components/admin/ui/Skeleton";

interface Settings {
  [key: string]: string;
}

const DAYS = [
  { value: "MONDAY", label: "Lundi" },
  { value: "TUESDAY", label: "Mardi" },
  { value: "WEDNESDAY", label: "Mercredi" },
  { value: "THURSDAY", label: "Jeudi" },
  { value: "FRIDAY", label: "Vendredi" },
  { value: "SATURDAY", label: "Samedi" },
  { value: "SUNDAY", label: "Dimanche" },
] as const;

const LANGUAGES = ["Français", "العربية", "English"] as const;
const CURRENCIES = ["TND", "EUR", "USD"] as const;
const TIMEZONES = [
  "Africa/Tunis",
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
] as const;
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const;

export default function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<Settings>({});
  const [saved, setSaved] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(saved);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/settings");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setSettings(data);
      setSaved(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => { await fetchSettings(); })();
  }, [fetchSettings]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setSaved(settings);
      addToast("Paramètres enregistrés", "success");
    } catch {
      addToast("Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Paramètres
          </h1>
        </div>
        <StatSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold text-white">
          Paramètres
        </h1>
        <div className="admin-card rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--admin-danger)]">{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--admin-danger)]/10 px-4 py-2 text-sm font-medium text-[var(--admin-danger)] transition-colors hover:bg-[var(--admin-danger)]/20"
          >
            <RotateCcw size={14} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Paramètres
          </h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Configurez les informations de votre salle
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="flex items-center gap-1.5 rounded-lg bg-[var(--admin-warning)]/10 px-3 py-1.5 text-xs font-medium text-[var(--admin-warning)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--admin-warning)]" />
              Modifications non enregistrées
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="admin-btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: General */}
        <Section
          icon={<Building2 size={18} />}
          title="Général"
          fields={[
            {
              key: "gymName",
              label: "Nom de la salle",
              placeholder: "Tayamo Sport",
            },
            {
              key: "logoUrl",
              label: "URL du logo",
              placeholder: "https://...",
              preview: "logoUrl",
            },
            {
              key: "faviconUrl",
              label: "URL du favicon",
              placeholder: "https://...",
              preview: "faviconUrl",
            },
          ]}
          fullWidth={["description"]}
          settings={settings}
          onChange={handleChange}
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
              Description
            </label>
            <textarea
              value={settings.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description de votre salle de sport..."
              rows={3}
              className="admin-input w-full resize-y"
            />
          </div>
        </Section>

        {/* Section 2: Contact */}
        <Section
          icon={<Phone size={18} />}
          title="Contact"
          fields={[
            {
              key: "phone",
              label: "Téléphone",
              placeholder: "+216 XX XXX XXX",
            },
            {
              key: "email",
              label: "Email",
              placeholder: "contact@tayamosport.com",
              type: "email",
            },
          ]}
          fullWidth={["address"]}
          settings={settings}
          onChange={handleChange}
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
              Adresse
            </label>
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Rue Principale, Tunis"
              className="admin-input w-full"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
              URL Google Maps (embed)
            </label>
            <input
              type="text"
              value={settings.mapEmbedUrl || ""}
              onChange={(e) => handleChange("mapEmbedUrl", e.target.value)}
              placeholder="https://www.google.com/maps/embed?..."
              className="admin-input w-full"
            />
          </div>
        </Section>

        {/* Section 3: Social Media */}
        <Section
          icon={<Share2 size={18} />}
          title="Réseaux sociaux"
          fields={[
            {
              key: "facebook",
              label: "Facebook",
              placeholder: "https://facebook.com/...",
            },
            {
              key: "instagram",
              label: "Instagram",
              placeholder: "https://instagram.com/...",
            },
            {
              key: "tiktok",
              label: "TikTok",
              placeholder: "https://tiktok.com/...",
            },
            {
              key: "youtube",
              label: "YouTube",
              placeholder: "https://youtube.com/...",
            },
          ]}
          settings={settings}
          onChange={handleChange}
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
              WhatsApp
            </label>
            <input
              type="text"
              value={settings.whatsapp || ""}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
              placeholder="+216 XX XXX XXX"
              className="admin-input w-full"
            />
          </div>
        </Section>

        {/* Section 4: Business */}
        <div className="admin-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[var(--admin-text-dim)]">
              <Clock size={18} />
            </span>
            <h2 className="text-base font-bold text-[var(--admin-text)]">
              Activité
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Heure d&apos;ouverture
              </label>
              <input
                type="time"
                value={settings.openingHour || ""}
                onChange={(e) => handleChange("openingHour", e.target.value)}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Heure de fermeture
              </label>
              <input
                type="time"
                value={settings.closingHour || ""}
                onChange={(e) => handleChange("closingHour", e.target.value)}
                className="admin-input w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[var(--admin-text-muted)]">
                Jours d&apos;ouverture
              </label>
              <div className="flex flex-wrap gap-3">
                {DAYS.map((day) => {
                  const current = settings.workingDays || "";
                  const selected = current
                    .split(",")
                    .filter(Boolean)
                    .includes(day.value);
                  return (
                    <label
                      key={day.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        selected
                          ? "border-[var(--admin-gold)]/40 bg-[var(--admin-gold)]/10 text-[var(--admin-gold)]"
                          : "border-[var(--admin-border)] bg-transparent text-[var(--admin-text-muted)] hover:border-[var(--admin-text-dim)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selected}
                        onChange={() => {
                          const current = settings.workingDays || "";
                          const arr = current
                            .split(",")
                            .filter(Boolean);
                          const next = selected
                            ? arr.filter((v) => v !== day.value)
                            : [...arr, day.value];
                          handleChange("workingDays", next.join(","));
                        }}
                      />
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                          selected
                            ? "border-[var(--admin-gold)] bg-[var(--admin-gold)] text-[var(--admin-surface)]"
                            : "border-[var(--admin-text-dim)]"
                        }`}
                      >
                        {selected && "✓"}
                      </span>
                      {day.label}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Localization */}
        <div className="admin-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[var(--admin-text-dim)]">
              <Globe size={18} />
            </span>
            <h2 className="text-base font-bold text-[var(--admin-text)]">
              Localisation
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Langue
              </label>
              <select
                value={settings.language || "Français"}
                onChange={(e) => handleChange("language", e.target.value)}
                className="admin-select w-full"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Devise
              </label>
              <select
                value={settings.currency || "TND"}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="admin-select w-full"
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Fuseau horaire
              </label>
              <select
                value={settings.timezone || "Africa/Tunis"}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="admin-select w-full"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                Format de date
              </label>
              <select
                value={settings.dateFormat || "DD/MM/YYYY"}
                onChange={(e) => handleChange("dateFormat", e.target.value)}
                className="admin-select w-full"
              >
                {DATE_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 6: Homepage Content */}
        <Section
          icon={<Layout size={18} />}
          title="Contenu de la page d'accueil"
          fields={[
            {
              key: "heroTitle",
              label: "Titre hero",
              placeholder: "Titre principal de la page d'accueil",
            },
            {
              key: "heroSubtitle",
              label: "Sous-titre hero",
              placeholder: "Sous-titre de la page d'accueil",
            },
            {
              key: "aboutTitle",
              label: "Titre de la section À propos",
              placeholder: "Qui sommes-nous ?",
            },
            {
              key: "ctaText",
              label: "Texte du bouton CTA",
              placeholder: "Réservez votre place",
            },
            {
              key: "ctaLink",
              label: "Lien du bouton CTA",
              placeholder: "/reservation",
            },
          ]}
          settings={settings}
          onChange={handleChange}
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
              Description de la section À propos
            </label>
            <textarea
              value={settings.aboutDescription || ""}
              onChange={(e) =>
                handleChange("aboutDescription", e.target.value)
              }
              placeholder="Description de votre salle de sport..."
              rows={3}
              className="admin-input w-full resize-y"
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  fields,
  settings,
  onChange,
  fullWidth,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type?: string;
    preview?: string;
  }[];
  settings: Settings;
  onChange: (key: string, value: string) => void;
  fullWidth?: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="admin-card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[var(--admin-text-dim)]">{icon}</span>
        <h2 className="text-base font-bold text-[var(--admin-text)]">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const isFull =
            fullWidth?.includes(field.key) || field.key.includes("description");
          return (
            <div
              key={field.key}
              className={isFull ? "sm:col-span-2" : ""}
            >
              <label className="mb-1 block text-sm font-medium text-[var(--admin-text-muted)]">
                {field.label}
              </label>
              <div className="flex items-center gap-3">
                {field.preview && settings[field.preview] ? (
                  <img
                    src={settings[field.preview]}
                    alt={field.label}
                    className="h-8 w-8 rounded border border-[var(--admin-border)] object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
                <input
                  type={field.type || "text"}
                  value={settings[field.key] || ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="admin-input w-full"
                />
              </div>
            </div>
          );
        })}
        {children}
      </div>
    </div>
  );
}
