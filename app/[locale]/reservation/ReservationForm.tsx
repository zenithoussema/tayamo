"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";

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
      <div className="rounded-2xl bg-green-50 p-8 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="mb-2 text-2xl font-bold text-green-800">{dict.success_title}</h2>
        <p className="mb-6 text-green-700">{dict.success_text}</p>

        <div className="mx-auto mb-6 max-w-sm rounded-xl bg-white p-4 text-left text-sm text-gray-700 shadow-sm">
          <p className="font-semibold text-primary-dark">
            {isAr ? "ملخص الحجز" : "Récapitulatif"}
          </p>
          <ul className="mt-2 space-y-1">
            <li><span className="text-gray-500">{isAr ? "النشاط: " : "Activité : "}</span>{activity ? (isAr ? activity.nameAr : activity.nameFr) : "—"}</li>
            {schedule && (
              <li><span className="text-gray-500">{isAr ? "التوقيت: " : "Horaire : "}</span>{dayNames[schedule.dayOfWeek][isAr ? 0 : 1]} {schedule.startTime}-{schedule.endTime}</li>
            )}
            <li><span className="text-gray-500">{isAr ? "الطفل: " : "Enfant : "}</span>{submittedData?.childName}</li>
            <li><span className="text-gray-500">{isAr ? "الولي: " : "Parent : "}</span>{submittedData?.parentName}</li>
          </ul>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
          </svg>
          {dict.success_whatsapp}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Plan badge from query param */}
      {planLabel && (
        <div className="rounded-xl bg-accent/20 px-4 py-3 text-center text-sm font-bold text-primary-dark">
          {planLabel}
        </div>
      )}

      {/* Activity */}
      <div className="flex flex-col gap-1">
        <label htmlFor="activityId" className="text-sm font-medium text-gray-700">
          {dict.label_activity}
        </label>
        <select
          id="activityId"
          name="activityId"
          required
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">—</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {isAr ? a.nameAr : a.nameFr}
            </option>
          ))}
        </select>
        {errors.activityId && <span className="text-xs text-red-500">{errors.activityId}</span>}
      </div>

      {/* Schedule (filtered by activity) */}
      {selectedActivity && filteredSchedules.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            {dict.label_schedule}
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredSchedules.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="radio"
                  name="scheduleId"
                  value={s.id}
                  className="accent-primary"
                />
                <div>
                  <span className="font-medium text-primary-dark">
                    {dayNames[s.dayOfWeek][isAr ? 0 : 1]}
                  </span>
                  <span className="text-gray-500">
                    {" "}{s.startTime}-{s.endTime}
                  </span>
                  <span className="block text-xs text-gray-400">{s.coachName}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Parent name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="parentName" className="text-sm font-medium text-gray-700">
          {dict.label_parent_name}
        </label>
        <input
          id="parentName"
          name="parentName"
          required
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.parentName && <span className="text-xs text-red-500">{errors.parentName}</span>}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1">
        <label htmlFor="parentPhone" className="text-sm font-medium text-gray-700">
          {dict.label_phone}
        </label>
        <input
          id="parentPhone"
          name="parentPhone"
          type="tel"
          required
          placeholder="+216 XX XXX XXX"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.parentPhone && <span className="text-xs text-red-500">{errors.parentPhone}</span>}
      </div>

      {/* Child name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="childName" className="text-sm font-medium text-gray-700">
          {dict.label_child_name}
        </label>
        <input
          id="childName"
          name="childName"
          required
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.childName && <span className="text-xs text-red-500">{errors.childName}</span>}
      </div>

      {/* Birth date (optional) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="childBirthDate" className="text-sm font-medium text-gray-700">
          {dict.label_birth_date}
        </label>
        <input
          id="childBirthDate"
          name="childBirthDate"
          type="date"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Trial checkbox */}
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5">
        <input
          type="checkbox"
          name="isTrialSession"
          defaultChecked
          className="h-4 w-4 accent-accent"
        />
        <span className="text-sm font-medium text-gray-700">{dict.label_trial}</span>
      </label>

      <Button variant="accent" size="lg" disabled={status === "loading"}>
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
