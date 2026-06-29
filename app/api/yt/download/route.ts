import { NextRequest, NextResponse } from "next/server";

// NOTE: No `export const runtime = "edge"`. @opennextjs/cloudflare requires the
// default Node.js Workers runtime; edge-runtime API routes 500 in production.

const DOWNLOAD_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// googlevideo (especially DASH `gir=yes` streams) throttle/truncate a single
// open-ended request and 403 large ranges, but serve closed ranges reliably.
// So we download in sequential closed chunks, exactly like yt-dlp.
const CHUNK = 8 * 1024 * 1024; // 8 MiB

/** RFC 6266 Content-Disposition that survives non-ASCII (e.g. Korean) titles. */
function contentDisposition(rawName: string): string {
  const cleaned =
    rawName.replace(/[\\/:*?"<>|\r\n\t]+/g, "_").slice(0, 200) || "video";
  const ascii = cleaned.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(cleaned);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

/** Stream [start, end] (inclusive) from a googlevideo URL via closed chunks. */
function chunkedStream(rawUrl: string, start: number, end: number) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let pos = start;
      try {
        while (pos <= end) {
          const chunkEnd = Math.min(pos + CHUNK - 1, end);
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 30_000);
          let res: Response;
          try {
            res = await fetch(rawUrl, {
              headers: {
                "User-Agent": DOWNLOAD_UA,
                Accept: "*/*",
                Range: `bytes=${pos}-${chunkEnd}`,
              },
              signal: ctrl.signal,
            });
          } finally {
            clearTimeout(timer);
          }
          if (res.status !== 206 && res.status !== 200) {
            controller.error(
              new Error(`Upstream chunk ${pos}-${chunkEnd} → HTTP ${res.status}`),
            );
            return;
          }
          if (!res.body) {
            const buf = new Uint8Array(await res.arrayBuffer());
            if (buf.length) controller.enqueue(buf);
            pos = chunkEnd + 1;
            if (!buf.length) break;
            continue;
          }
          const reader = res.body.getReader();
          let got = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value && value.length) {
              controller.enqueue(value);
              got += value.length;
            }
          }
          if (got === 0) break; // safety: avoid infinite loop on empty chunk
          pos = chunkEnd + 1;
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
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
    const isGoogleVideo =
      host === "googlevideo.com" || host.endsWith(".googlevideo.com");
    const allowed =
      isGoogleVideo ||
      host.endsWith(".youtube.com") ||
      host.endsWith(".ytimg.com") ||
      host.endsWith(".ggpht.com");
    if (parsed.protocol !== "https:" || !allowed) {
      return NextResponse.json({ error: "host not allowed" }, { status: 400 });
    }

    const total = Number(parsed.searchParams.get("clen") || "0");

    // Non-video CDN (thumbnails) or unknown size: simple passthrough.
    if (!isGoogleVideo || !total) {
      const range = request.headers.get("range");
      const upstream = await fetch(videoUrl, {
        headers: {
          "User-Agent": DOWNLOAD_UA,
          Accept: "*/*",
          ...(range ? { Range: range } : {}),
        },
      });
      if (!upstream.ok && upstream.status !== 206) {
        return NextResponse.redirect(videoUrl, 302);
      }
      const h = new Headers();
      h.set("Content-Type", upstream.headers.get("content-type") || "video/mp4");
      h.set("Content-Disposition", contentDisposition(filename));
      const cl = upstream.headers.get("content-length");
      if (cl) h.set("Content-Length", cl);
      h.set("Cache-Control", "public, max-age=3600");
      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: h,
      });
    }

    // Honor a client Range (seek/resume); otherwise serve the whole file.
    const clientRange = request.headers.get("range");
    let start = 0;
    let end = total - 1;
    let partial = false;
    if (clientRange) {
      const m = clientRange.match(/bytes=(\d+)-(\d*)/);
      if (m) {
        start = parseInt(m[1], 10);
        end = m[2] ? Math.min(parseInt(m[2], 10), total - 1) : total - 1;
        partial = true;
      }
    }
    if (start > end || start < 0) {
      return NextResponse.json({ error: "invalid range" }, { status: 416 });
    }

    const headers = new Headers();
    const guessedType = parsed.searchParams.get("mime") || "video/mp4";
    headers.set("Content-Type", decodeURIComponent(guessedType));
    headers.set("Content-Disposition", contentDisposition(filename));
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Length", String(end - start + 1));
    headers.set("Cache-Control", "public, max-age=3600");
    if (partial) {
      headers.set("Content-Range", `bytes ${start}-${end}/${total}`);
    }

    return new NextResponse(chunkedStream(videoUrl, start, end), {
      status: partial ? 206 : 200,
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
