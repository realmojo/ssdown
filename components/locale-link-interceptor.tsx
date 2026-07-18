"use client";

import { useEffect } from "react";

/**
 * Keeps Korean visitors inside the /kr URL tree while navigating.
 *
 * Internal links are rendered as root-absolute paths (e.g. /software/mac/foo)
 * regardless of locale. On /kr pages this listener rewrites left-click
 * navigations to their /kr equivalent so users stay in Korean, without having
 * to localize every href across the app. Crawlers still see the root links and
 * rely on hreflang for the en/ko pairing.
 */
export function LocaleLinkInterceptor() {
  useEffect(() => {
    if (!window.location.pathname.startsWith("/kr")) return;

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only rewrite internal, root-absolute paths that aren't already /kr,
      // API routes, or protocol-relative URLs.
      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !href.startsWith("/api/") &&
        href !== "/kr" &&
        !href.startsWith("/kr/");
      if (!isInternal) return;

      event.preventDefault();
      window.location.assign(href === "/" ? "/kr" : `/kr${href}`);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
