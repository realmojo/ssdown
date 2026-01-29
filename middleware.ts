import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { lambdaProxy } from "./lambda/index";

export async function middleware(request: NextRequest) {
  try {
    // Lambda proxy 처리 (다운로드 API 등)
    const lambdaResponse = await lambdaProxy(request);
    if (lambdaResponse) {
      return lambdaResponse;
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
