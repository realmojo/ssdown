import { NextRequest, NextResponse } from "next/server";

// NOTE: No `export const runtime = "edge"`. @opennextjs/cloudflare requires the
// default Node.js Workers runtime; edge-runtime API routes 500 in production.
// Streaming (new NextResponse(upstream.body)) works fine on the Node runtime.

// Match the ANDROID_VR client UA used to mint the URL in app/api/yt/route.ts.
// The googlevideo (GVS) CDN is UA/session sensitive, so the proxied byte fetch
// should present the same client identity as the /player request that produced it.
const DOWNLOAD_UA =
  "com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip";

/**
 * Build an RFC 6266 compliant Content-Disposition value that survives non-ASCII
 * (e.g. Korean) video titles by providing both an ASCII fallback and a UTF-8 form.
 */
function contentDisposition(rawName: string): string {
  const cleaned =
    rawName.replace(/[\\/:*?"<>|\r\n\t]+/g, "_").slice(0, 200) || "video";
  const ascii = cleaned.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(cleaned);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("videoUrl");
    const filename =
      searchParams.get("filename") ?? `ssdown-youtube-${Date.now()}.mp4`;

    if (!videoUrl) {
      return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
    }

    // SSRF guard: only proxy Google's video/thumbnail CDNs.
    let parsed: URL;
    try {
      parsed = new URL(videoUrl);
    } catch {
      return NextResponse.json({ error: "invalid videoUrl" }, { status: 400 });
    }
    const host = parsed.hostname;
    const allowed =
      host === "googlevideo.com" ||
      host.endsWith(".googlevideo.com") ||
      host.endsWith(".youtube.com") ||
      host.endsWith(".ytimg.com") ||
      host.endsWith(".ggpht.com");
    if (parsed.protocol !== "https:" || !allowed) {
      return NextResponse.json({ error: "host not allowed" }, { status: 400 });
    }

    // Forward Range so the browser can resume / seek large downloads.
    const range = request.headers.get("range");
    const upstream = await fetch(videoUrl, {
      headers: {
        "User-Agent": DOWNLOAD_UA,
        Accept: "*/*",
        ...(range ? { Range: range } : {}),
      },
    });

    if (!upstream.ok && upstream.status !== 206) {
      // Last resort: let the browser hit the direct URL itself.
      return NextResponse.redirect(videoUrl, 302);
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstream.headers.get("content-type") || "video/mp4",
    );
    headers.set("Content-Disposition", contentDisposition(filename));
    const len = upstream.headers.get("content-length");
    if (len) headers.set("Content-Length", len);
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);
    headers.set(
      "Accept-Ranges",
      upstream.headers.get("accept-ranges") || "bytes",
    );
    headers.set("Cache-Control", "public, max-age=3600");

    // Stream the body straight through — never buffer the whole file in memory.
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (e: any) {
    console.error("Error in GET /api/yt/download:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
