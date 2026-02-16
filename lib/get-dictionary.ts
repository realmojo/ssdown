import "server-only";
import en from "@/dictionaries/en.json";
import type { Locale } from "@/lib/i18n-utils";

type Dictionary = typeof en;

/**
 * Deep-merge Korean dictionary over English defaults.
 * Any missing key in kr.json automatically falls back to the English value,
 * so we can incrementally translate without breaking the UI.
 */
function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>
): T {
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(override)) {
    const baseVal = result[key];
    const overrideVal = override[key];

    if (
      typeof baseVal === "object" &&
      baseVal !== null &&
      !Array.isArray(baseVal) &&
      typeof overrideVal === "object" &&
      overrideVal !== null &&
      !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>
      );
    } else if (overrideVal !== undefined && overrideVal !== "") {
      result[key] = overrideVal;
    }
  }
  return result as T;
}

const dictionaryLoaders: Record<Locale, () => Promise<Dictionary>> = {
  en: async () => en,
  kr: async () => {
    const kr = (await import("@/dictionaries/kr.json")).default;
    return deepMerge(en, kr as Record<string, unknown>);
  },
};

export const getDictionary = async (locale: Locale = "en"): Promise<Dictionary> => {
  const loader = dictionaryLoaders[locale];
  return loader ? loader() : en;
};
