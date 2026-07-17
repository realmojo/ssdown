import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n-utils";

export const SITE_URL = "https://ssdown.app";

/**
 * Whether Korean pages under /kr/* are served (via the middleware rewrite).
 * When true, the `ko` hreflang is emitted and Korean pages self-canonicalize
 * to their /kr URL.
 */
export const KR_PAGES_LIVE = true;

function enPath(path: string): string {
  return path === "/" ? "" : path;
}

/** Absolute English + Korean URLs for a given root-relative path. */
export function localizedUrls(path: string): { en: string; ko: string } {
  const p = enPath(path);
  return { en: `${SITE_URL}${p}`, ko: `${SITE_URL}/kr${p}` };
}

/**
 * Add the `/kr` prefix to a root-relative path when the locale is Korean.
 * Use for building locale-aware internal links.
 */
export function localizedPath(path: string, locale: Locale): string {
  if (locale !== "kr") return path;
  const p = enPath(path);
  return `/kr${p}` || "/kr";
}

/** hreflang map: English at the root URL, Korean under /kr (when live). */
export function languagesForUrl(enUrl: string): Record<string, string> {
  const languages: Record<string, string> = {
    en: enUrl,
    "x-default": enUrl,
  };
  if (KR_PAGES_LIVE) {
    const path = enUrl.startsWith(SITE_URL) ? enUrl.slice(SITE_URL.length) : "";
    languages.ko = `${SITE_URL}/kr${path}`;
  }
  return languages;
}

/**
 * Build the `alternates` block for a page: a locale-aware self-referencing
 * canonical plus hreflang annotations. English pages canonicalize to the root
 * URL; Korean pages canonicalize to their /kr URL.
 *
 * @param path   Pathname beginning with "/" (use "" for the homepage).
 * @param locale Current request locale.
 * @param extra  Additional alternates to merge (e.g. RSS `types`).
 */
export function buildAlternates(
  path: string,
  locale: Locale = "en",
  extra?: Metadata["alternates"],
): Metadata["alternates"] {
  const { en, ko } = localizedUrls(path);
  const languages: Record<string, string> = {
    en,
    "x-default": en,
  };
  if (KR_PAGES_LIVE) {
    languages.ko = ko;
  }
  return {
    canonical: locale === "kr" ? ko : en,
    languages,
    ...extra,
  };
}
