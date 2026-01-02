import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n-config";
import { lambdaProxy } from "./lambda/index";

export const runtime = "edge";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Lambda proxy 처리 (다운로드 API 등)
  const lambdaResponse = await lambdaProxy(request);
  if (lambdaResponse) {
    return lambdaResponse;
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
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

    // Default: Rewrite to default locale (en) internally
    // so ssdown.app/x shows English version but keeps URL clean-ish or consistent
    return NextResponse.rewrite(
      new URL(
        `/${i18n.defaultLocale}${
          pathname.startsWith("/") ? "" : "/"
        }${pathname}`,
        request.url
      )
    );
  }

  return;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/x/download",
  ],
};
