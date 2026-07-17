import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { lambdaProxy } from "./lambda/index";
import {
  LOCALE_HEADER_NAME,
  type Locale,
} from "@/lib/i18n-utils";

export async function middleware(request: NextRequest) {
  try {
    // Lambda proxy handling (download API proxying)
    const lambdaResponse = await lambdaProxy(request);
    if (lambdaResponse) {
      return lambdaResponse;
    }

    // --- URL-based locale ---
    // English lives at the root; Korean lives under /kr/*. The prefix (not a
    // cookie or geo header) decides the locale so each language has a stable,
    // crawlable URL. /kr/* is rewritten onto the underlying route with the
    // locale forwarded to server components via a request header.
    const { pathname } = request.nextUrl;
    const isKr = pathname === "/kr" || pathname.startsWith("/kr/");
    const locale: Locale = isKr ? "kr" : "en";

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER_NAME, locale);

    if (isKr) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice(3) || "/";
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
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
