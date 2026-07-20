"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle, MessageCircle } from "lucide-react";

interface ActivityItem {
  id: number;
  nameAr: string;
  nameFr: string;
  slug: string;
}

interface ScheduleItem {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  coachName: string;
  activityId: number;
}

const dayNames: Record<string, [string, string]> = {
  MONDAY: ["الإثنين", "Lundi"],
  TUESDAY: ["الثلاثاء", "Mardi"],
  WEDNESDAY: ["الأربعاء", "Mercredi"],
  THURSDAY: ["الخميس", "Jeudi"],
  FRIDAY: ["الجمعة", "Vendredi"],
  SATURDAY: ["السبت", "Samedi"],
  SUNDAY: ["الأحد", "Dimanche"],
};

const PHONE_REGEX = /^(\+216)?[0-9]{8,15}$/;

interface Props {
  dict: Record<string, string>;
  locale: string;
  isAr: boolean;
  activities: ActivityItem[];
  schedules: ScheduleItem[];
  preselectedPlanName: string | null;
  whatsappUrl: string;
}

export function ReservationForm({
  dict,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale,
  isAr,
  activities,
  schedules,
  preselectedPlanName,
  whatsappUrl,
}: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedData, setSubmittedData] = useState<Record<string, string | number | boolean> | null>(null);

  const planLabel = preselectedPlanName ? dict.plan_badge + preselectedPlanName : null;

  const filteredSchedules = useMemo(
    () => schedules.filter((s) => s.activityId === parseInt(selectedActivity)),
    [selectedActivity, schedules],
  );

  function validate(form: FormData): Record<string, string> {
    const errs: Record<string, string> = {};
    const parentName = form.get("parentName") as string;
    const phone = form.get("parentPhone") as string;
    const childName = form.get("childName") as string;
    const activity = form.get("activityId") as string;

    if (!parentName?.trim()) errs.parentName = dict.error_required;
    if (!phone?.trim()) errs.parentPhone = dict.error_required;
    else if (!PHONE_REGEX.test(phone.trim())) errs.parentPhone = dict.error_phone;
    if (!childName?.trim()) errs.childName = dict.error_required;
    if (!activity) errs.activityId = dict.error_required;

    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setStatus("loading");

    const payload: Record<string, string | number | boolean> = {};
    for (const key of ["activityId", "scheduleId", "parentName", "parentPhone", "childName", "childBirthDate"]) {
      const val = form.get(key);
      if (val && typeof val === "string") payload[key] = val;
    }
    payload.isTrialSession = form.get("isTrialSession") === "on";

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedData(data.booking);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    const activity = activities.find((a) => a.id === submittedData?.activityId);
    const schedule = submittedData?.scheduleId
      ? schedules.find((s) => s.id === submittedData.scheduleId)
      : null;

    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
        <h2 className="mb-3 text-2xl font-bold text-text">{dict.success_title}</h2>
        <p className="mb-6 text-text-muted">{dict.success_text}</p>

        <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-border-strong bg-surface p-5 text-left text-sm">
          <p className="font-semibold text-accent">
            {isAr ? "ملخص الحجز" : "Récapitulatif"}
          </p>
          <ul className="mt-3 space-y-2 text-text-secondary">
            <li><span className="text-text-dim">{isAr ? "النشاط: " : "Activité : "}</span>{activity ? (isAr ? activity.nameAr : activity.nameFr) : "—"}</li>
            {schedule && (
              <li><span className="text-text-dim">{isAr ? "التوقيت: " : "Horaire : "}</span>{dayNames[schedule.dayOfWeek][isAr ? 0 : 1]} {schedule.startTime}-{schedule.endTime}</li>
            )}
            <li><span className="text-text-dim">{isAr ? "الطفل: " : "Enfant : "}</span>{submittedData?.childName}</li>
            <li><span className="text-text-dim">{isAr ? "الولي: " : "Parent : "}</span>{submittedData?.parentName}</li>
          </ul>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition-colors hover:bg-emerald-500"
        >
          <MessageCircle className="h-5 w-5" />
          {dict.success_whatsapp}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7 lg:p-8">
      {/* Plan badge from query param */}
      {planLabel && (
        <div className="rounded-xl border border-accent/20 bg-accent-faint px-4 py-3 text-center text-sm font-bold text-accent">
          {planLabel}
        </div>
      )}

      {/* Activity */}
      <div className="flex flex-col gap-2">
        <label htmlFor="activityId" className="text-sm font-medium text-text-secondary">
          {dict.label_activity}
        </label>
        <select
          id="activityId"
          name="activityId"
          required
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="premium-select"
        >
          <option value="">—</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {isAr ? a.nameAr : a.nameFr}
            </option>
          ))}
        </select>
        {errors.activityId && <span className="text-xs text-red-400">{errors.activityId}</span>}
      </div>

      {/* Schedule (filtered by activity) */}
      {selectedActivity && filteredSchedules.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-text-secondary">
            {dict.label_schedule}
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredSchedules.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-strong bg-white/[0.02] p-4 text-sm transition-all duration-300 has-[:checked]:border-accent/30 has-[:checked]:bg-accent-faint"
              >
                <input
                  type="radio"
                  name="scheduleId"
                  value={s.id}
                  className="accent-[var(--c-accent)]"
                />
                <div>
                  <span className="font-medium text-text">
                    {dayNames[s.dayOfWeek][isAr ? 0 : 1]}
                  </span>
                  <span className="text-text-muted">
                    {" "}{s.startTime}-{s.endTime}
                  </span>
                  <span className="block text-xs text-text-dim">{s.coachName}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Parent name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="parentName" className="text-sm font-medium text-text-secondary">
          {dict.label_parent_name}
        </label>
        <input
          id="parentName"
          name="parentName"
          required
          className="premium-input"
        />
        {errors.parentName && <span className="text-xs text-red-400">{errors.parentName}</span>}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <label htmlFor="parentPhone" className="text-sm font-medium text-text-secondary">
          {dict.label_phone}
        </label>
        <input
          id="parentPhone"
          name="parentPhone"
          type="tel"
          required
          placeholder="+216 XX XXX XXX"
          className="premium-input"
        />
        {errors.parentPhone && <span className="text-xs text-red-400">{errors.parentPhone}</span>}
      </div>

      {/* Child name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="childName" className="text-sm font-medium text-text-secondary">
          {dict.label_child_name}
        </label>
        <input
          id="childName"
          name="childName"
          required
          className="premium-input"
        />
        {errors.childName && <span className="text-xs text-red-400">{errors.childName}</span>}
      </div>

      {/* Birth date (optional) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="childBirthDate" className="text-sm font-medium text-text-secondary">
          {dict.label_birth_date}
        </label>
        <input
          id="childBirthDate"
          name="childBirthDate"
          type="date"
          className="premium-input"
        />
      </div>

      {/* Trial checkbox */}
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-strong bg-white/[0.02] p-4 transition-all duration-300 has-[:checked]:border-accent/30 has-[:checked]:bg-accent-faint">
        <input
          type="checkbox"
          name="isTrialSession"
          defaultChecked
          className="h-4 w-4 accent-[#D4AF37]"
        />
        <span className="text-sm font-medium text-text-secondary">{dict.label_trial}</span>
      </label>

      <Button variant="accent" size="lg" disabled={status === "loading"}>
        {status === "loading" ? "..." : dict.submit}
      </Button>

      {status === "error" && (
        <p className="text-center text-sm text-red-400">
          {isAr ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "Une erreur est survenue. Veuillez réessayer."}
        </p>
      )}
    </form>
  );
}
