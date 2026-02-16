import "server-only";
import { headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_HEADER_NAME,
  isValidLocale,
  type Locale,
} from "@/lib/i18n-utils";

/**
 * Read the current locale from the request headers set by middleware.
 * This must be called from a Server Component or generateMetadata.
 */
export async function getLocale(): Promise<Locale> {
  const headerStore = await headers();
  const value = headerStore.get(LOCALE_HEADER_NAME);
  return isValidLocale(value) ? value : DEFAULT_LOCALE;
}
