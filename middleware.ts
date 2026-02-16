import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { lambdaProxy } from "./lambda/index";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  detectLocaleFromHeaders,
  getLocaleFromCookieString,
  type Locale,
} from "@/lib/i18n-utils";

export async function middleware(request: NextRequest) {
  try {
    // Lambda proxy handling (download API proxying)
    const lambdaResponse = await lambdaProxy(request);
    if (lambdaResponse) {
      return lambdaResponse;
    }

    // --- Locale detection ---
    const cookieHeader = request.headers.get("cookie");
    const cookieLocale = getLocaleFromCookieString(cookieHeader);
    const needsCookie = !cookieLocale;

    const locale: Locale = cookieLocale ?? detectLocaleFromHeaders(request.headers);

    // Forward locale to server components via request header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER_NAME, locale);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // Set cookie if not already present (1 year expiry)
    if (needsCookie) {
      response.cookies.set(LOCALE_COOKIE_NAME, locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    // Help CDN vary caching by cookie
    response.headers.set("Vary", "Cookie");

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (e.g. .png, .jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/api/x/download",
  ],
};
