"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ActivityItem {
  id: number;
  nameAr: string;
  nameFr: string;
}

interface Props {
  dict: Record<string, string>;
  locale: string;
  isAr: boolean;
  activities: ActivityItem[];
  whatsappUrl: string;
}

export function ContactForm({ dict,   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale, isAr, activities, whatsappUrl }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email"),
        message: form.get("message"),
        activityInterest: form.get("activityInterest"),
      }),
    });

    if (res.ok) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-green-50 p-8 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="mb-2 text-2xl font-bold text-green-800">{dict.success}</h2>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
          </svg>
          {dict.whatsapp || "WhatsApp"}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          {dict.name}
        </label>
        <input
          id="name"
          name="name"
          required
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">
          {dict.phone}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+216 XX XXX XXX"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Activity interest dropdown */}
      <div className="flex flex-col gap-1">
        <label htmlFor="activityInterest" className="text-sm font-medium text-gray-700">
          {dict.label_activity_interest}
        </label>
        <select
          id="activityInterest"
          name="activityInterest"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">—</option>
          {activities.map((a) => (
            <option key={a.id} value={isAr ? a.nameAr : a.nameFr}>
              {isAr ? a.nameAr : a.nameFr}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium text-gray-700">
          {dict.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <Button variant="primary" size="lg" disabled={status === "loading"}>
        {status === "loading" ? "..." : dict.submit}
      </Button>

      {status === "error" && (
        <p className="text-center text-sm text-red-500">
          {isAr ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "Une erreur est survenue. Veuillez réessayer."}
        </p>
      )}
    </form>
  );
}
