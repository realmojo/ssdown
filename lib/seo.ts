import type { Metadata } from "next";

export const SITE_URL = "https://ssdown.app";

/**
 * Whether Korean pages under /kr/* exist yet. Flip to `true` once the
 * localized URL tree is live so that the `ko` hreflang starts pointing at
 * real Korean URLs instead of 404s.
 */
const KR_PAGES_LIVE = false;

/**
 * hreflang map for an English URL. English lives at the given URL; Korean
 * (when live) lives at the same path prefixed with `/kr`.
 *
 * @param enUrl Absolute English URL (e.g. https://ssdown.app/software/mac/foo).
 */
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
 * Build the `alternates` block for a page: a self-referencing canonical plus
 * hreflang annotations.
 *
 * @param path Pathname beginning with "/" (use "" for the homepage).
 * @param extra Additional alternates to merge (e.g. RSS `types`).
 */
export function buildAlternates(
  path: string,
  extra?: Metadata["alternates"],
): Metadata["alternates"] {
  const normalized = path === "/" ? "" : path;
  const enUrl = `${SITE_URL}${normalized}`;
  return {
    canonical: enUrl,
    languages: languagesForUrl(enUrl),
    ...extra,
  };
}
