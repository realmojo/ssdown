import type { Metadata } from "next";

export const SITE_URL = "https://ssdown.app";

/**
 * Build the `alternates` block for a page: a self-referencing canonical at the
 * root URL. The site serves Korean only, so no hreflang annotations are
 * emitted and there is no locale prefix in the URL.
 *
 * @param path  Pathname beginning with "/" (use "" for the homepage).
 * @param extra Additional alternates to merge (e.g. RSS `types`).
 */
export function buildAlternates(
  path: string,
  extra?: Metadata["alternates"],
): Metadata["alternates"] {
  const p = path === "/" ? "" : path;
  return {
    canonical: `${SITE_URL}${p}`,
    ...extra,
  };
}
