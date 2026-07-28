import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { lambdaProxy } from "./lambda/index";

export async function middleware(request: NextRequest) {
  try {
    // Lambda proxy handling (download API proxying)
    const lambdaResponse = await lambdaProxy(request);
    if (lambdaResponse) {
      return lambdaResponse;
    }

    // --- Korean-only URLs ---
    // The site used to serve English at the root and Korean under /kr/*.
    // Korean now lives at the root, so the legacy /kr tree is permanently
    // redirected to its root equivalent to hand its indexed URLs' equity over.
    const { pathname, search } = request.nextUrl;
    if (pathname === "/kr" || pathname.startsWith("/kr/")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice(3) || "/";
      url.search = search;
      return NextResponse.redirect(url, 301);
    }

    return NextResponse.next();
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
