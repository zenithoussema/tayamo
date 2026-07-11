import "server-only";

import type { Locale } from "./locale";

const dictionaries = {
  ar: () => import("@/messages/ar.json").then((m) => m.default),
  fr: () => import("@/messages/fr.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
