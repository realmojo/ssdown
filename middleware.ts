import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n-config";
import { lambdaProxy } from "./lambda/index";

export const runtime = "experimental-edge";

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    // Lambda proxy 처리 (다운로드 API 등)
    const lambdaResponse = await lambdaProxy(request);
    if (lambdaResponse) {
      return lambdaResponse;
    }

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
      // Root path redirects to /en
      if (pathname === "/") {
        return NextResponse.redirect(
          new URL(`/${i18n.defaultLocale}`, request.url)
        );
      }

      // Check if it's a public file or API
      if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".") || // files like favicon.ico, robots.txt
        pathname === "/about" ||
        pathname === "/privacy" ||
        pathname === "/terms"
      ) {
        return;
      }

      // Geo-IP Check for Korea
      // const country =
      //   (request as any).geo?.country ||
      //   request.headers.get("x-vercel-ip-country") ||
      //   request.headers.get("cf-ipcountry");

      // // If User is in Korea, redirect to /kr prefix
      // if (country === "KR") {
      //   return NextResponse.redirect(
      //     new URL(
      //       `/kr${pathname.startsWith("/") ? "" : "/"}${pathname}`,
      //       request.url
      //     )
      //   );
      // }

      // Default: Redirect to default locale (en)
      // /x -> /en/x
      const redirectPath = `/${i18n.defaultLocale}${pathname}`;
      const redirectUrl = new URL(redirectPath, request.url);
      redirectUrl.search = request.nextUrl.search; // Preserve query parameters

      return NextResponse.redirect(redirectUrl);
    }

    return;
  } catch (error) {
    // 에러 발생 시 기본 경로로 fallback
    console.error("Middleware error:", error);
    const fallbackUrl = new URL(`/${i18n.defaultLocale}`, request.url);
    return NextResponse.rewrite(fallbackUrl);
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
