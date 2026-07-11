export const ACTIVITIES = [
  { nameFr: "Karaté", slug: "karate" },
  { nameFr: "Cardio", slug: "cardio" },
  { nameFr: "Fitness", slug: "fitness" },
  { nameFr: "CrossFit", slug: "crossfit" },
  { nameFr: "Gymnastique", slug: "gymnastique" },
  { nameFr: "Taekwondo", slug: "taekwondo" },
  { nameFr: "Musculation", slug: "musculation" },
  { nameFr: "Aérobic", slug: "aerobic" },
  { nameFr: "Kick Boxing", slug: "kick-boxing" },
] as const;

export type ActivityName = (typeof ACTIVITIES)[number]["nameFr"];

export function slugToActivityName(slug: string): string {
  return ACTIVITIES.find((a) => a.slug === slug)?.nameFr ?? decodeURIComponent(slug);
}

export function activityNameToSlug(name: string): string {
  return ACTIVITIES.find((a) => a.nameFr === name)?.slug ?? name.toLowerCase().replace(/\s+/g, "-");
}
