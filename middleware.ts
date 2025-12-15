import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n-config";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignore files (images, favicon, etc) and API routes
  if (
    pathname.includes(".") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml")
  ) {
    return;
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Determine priority locale
  let locale = i18n.defaultLocale;

  // 1. Geo-IP Country Check (Prioritize Korea)
  // Supports Vercel (x-vercel-ip-country) and Cloudflare (cf-ipcountry)
  const country = request.geo?.country || 
                  request.headers.get("x-vercel-ip-country") || 
                  request.headers.get("cf-ipcountry");

  if (country === "KR") {
    locale = "kr";
  } else {
     // 2. Accept-Language Check (Simple match)
     const acceptLanguage = (request.headers.get("accept-language") || "").toLowerCase();
     if (acceptLanguage.includes("ko")) {
       locale = "kr";
     } else if (acceptLanguage.includes("ja")) {
       locale = "jp";
     } else if (acceptLanguage.includes("pt")) {
       locale = "pt";
     } else if (acceptLanguage.includes("fr")) {
       locale = "fr";
     }
  }

  // Redirect to localized URL
  const url = new URL(request.url);
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
