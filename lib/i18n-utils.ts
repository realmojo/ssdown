/**
 * i18n utilities for IP-based locale detection.
 *
 * Design decisions:
 * - No "server-only" import so middleware (Edge Runtime) can also use these.
 * - CF-IPCountry header is set by Cloudflare (and Vercel) automatically.
 * - Cookie persists user preference for 1 year to avoid repeated detection.
 */

export type Locale = "en" | "kr";

export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "kr"] as const;
export const LOCALE_COOKIE_NAME = "ssdown-locale";
export const LOCALE_HEADER_NAME = "x-user-locale";

/** Country codes that map to Korean locale */
const KOREAN_COUNTRY_CODES = new Set(["KR"]);

export function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

/**
 * Detect locale from IP geolocation headers.
 * Checks Cloudflare (CF-IPCountry) and Vercel (x-vercel-ip-country) headers.
 */
export function detectLocaleFromHeaders(headers: Headers): Locale {
  const country =
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    "";

  return KOREAN_COUNTRY_CODES.has(country.toUpperCase()) ? "kr" : "en";
}

/**
 * Extract locale from a cookie header string.
 * Parses the raw Cookie header to avoid dependency on specific cookie libraries.
 */
export function getLocaleFromCookieString(cookieHeader: string | null): Locale | null {
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${LOCALE_COOKIE_NAME}=`));

  if (!match) return null;

  const value = match.split("=")[1];
  return isValidLocale(value) ? value : null;
}
