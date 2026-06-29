import { NextRequest, NextResponse } from "next/server";

// NOTE: Do NOT set `export const runtime = "edge"`. This app deploys via
// @opennextjs/cloudflare, where edge-runtime API routes crash with a 500
// "Internal Server Error"; the default Node.js Workers runtime is required.
// This route only uses fetch + Web APIs, so it runs fine on Node.

/**
 * YouTube single-video downloader (fetch-only, no yt-dlp).
 *
 * YouTube's WEB client returns signatureCipher + n-throttle + SABR formats that
 * are impossible to resolve without a JS player. The ANDROID_VR / IOS InnerTube
 * clients are REQUIRE_JS_PLAYER=False (plain, ready-to-use `url`) and PO-token
 * free. We return three kinds of download options:
 *
 *  - "progressive": a single muxed MP4 (itag 22 / 18). Best UX, but YouTube is
 *    phasing these out, so they are frequently absent.
 *  - "merge": a separate H.264 video-only MP4 + AAC audio-only M4A. These are
 *    almost always available (up to 1080p) with plain URLs. The browser merges
 *    them with ffmpeg.wasm (`-c copy`, no re-encode) — see ytdown-client.
 *  - "audio": the M4A audio-only track on its own.
 *
 * Mirrors down.js's "H.264 + AAC mp4 for max compatibility".
 */

const PLAYER_URL =
  "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

// Pinned client identities. clientVersion is a magic value — newer ANDROID_VR
// versions silently downgrade to SABR-only (no downloadable url). If downloads
// start failing site-wide, bump these to match yt-dlp master's _base.py.
const CLIENTS = {
  android_vr: {
    clientName: "ANDROID_VR",
    clientVersion: "1.65.10",
    clientNameId: "28",
    deviceMake: "Oculus",
    deviceModel: "Quest 3",
    osName: "Android",
    osVersion: "12L",
    androidSdkVersion: 32,
    userAgent:
      "com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
  },
  ios: {
    clientName: "IOS",
    clientVersion: "21.02.3",
    clientNameId: "5",
    deviceMake: "Apple",
    deviceModel: "iPhone16,2",
    osName: "iPhone",
    osVersion: "18.3.2.22D82",
    userAgent:
      "com.google.ios.youtube/21.02.3 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
  },
} as const;

type ClientKey = keyof typeof CLIENTS;

const getYoutubeId = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("m.youtube.com")
    ) {
      if (parsed.pathname.includes("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1].split("/")[0];
      }
      if (parsed.pathname.includes("/live/")) {
        return parsed.pathname.split("/live/")[1].split("/")[0];
      }
      if (parsed.searchParams.has("v")) {
        return parsed.searchParams.get("v");
      }
      if (
        parsed.pathname.startsWith("/embed/") ||
        parsed.pathname.startsWith("/v/")
      ) {
        return parsed.pathname.split("/")[2];
      }
    }
    return null;
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
  }
};

interface YtFormat {
  itag?: number;
  url?: string;
  mimeType?: string;
  bitrate?: number;
  qualityLabel?: string;
  width?: number;
  height?: number;
  contentLength?: string;
}

/** fetch with an AbortController timeout so a hung upstream can't stall the route. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fetchPlayer(videoId: string, key: ClientKey): Promise<any> {
  const c = CLIENTS[key];
  const poToken = process.env.YT_PO_TOKEN; // optional config seam (future-proofing)

  const body: Record<string, any> = {
    context: {
      client: {
        clientName: c.clientName,
        clientVersion: c.clientVersion,
        deviceMake: c.deviceMake,
        deviceModel: c.deviceModel,
        osName: c.osName,
        osVersion: c.osVersion,
        ...("androidSdkVersion" in c
          ? { androidSdkVersion: c.androidSdkVersion }
          : {}),
        hl: "en",
        gl: "US",
        userAgent: c.userAgent,
      },
    },
    videoId,
    contentCheckOk: true,
    racyCheckOk: true,
    playbackContext: {
      contentPlaybackContext: { html5Preference: "HTML5_PREF_WANTS" },
    },
  };

  if (poToken) {
    body.serviceIntegrityDimensions = { poToken };
  }

  const res = await fetchWithTimeout(
    PLAYER_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": c.userAgent,
        "X-YouTube-Client-Name": c.clientNameId,
        "X-YouTube-Client-Version": c.clientVersion,
        Origin: "https://www.youtube.com",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    },
    10_000,
  );

  if (!res.ok) {
    throw new Error(`Player request failed (${key}): HTTP ${res.status}`);
  }
  return res.json();
}

function proxy(rawUrl: string, filename: string): string {
  return `/api/yt/download?videoUrl=${encodeURIComponent(
    rawUrl,
  )}&filename=${encodeURIComponent(filename)}`;
}

// Progressive (single muxed file) — best UX, no merge needed.
const PROGRESSIVE: { itag: number; quality: string }[] = [
  { itag: 22, quality: "720p" },
  { itag: 18, quality: "360p" },
];
// Adaptive H.264 (avc1) video-only MP4 — merged with audio in the browser.
const MERGE_VIDEO: { itag: number; quality: string }[] = [
  { itag: 137, quality: "1080p" },
  { itag: 136, quality: "720p" },
  { itag: 135, quality: "480p" },
  { itag: 134, quality: "360p" },
];
// Adaptive AAC audio-only M4A (prefer the higher-bitrate 140).
const AUDIO_ITAGS = [140, 139];

interface DownloadOption {
  quality: string;
  content_type: string;
  kind: "progressive" | "merge" | "audio";
  url: string; // progressive/audio: proxy URL. merge: "" (uses videoUrl/audioUrl)
  videoUrl?: string;
  audioUrl?: string;
}

/** Build the combined list of download options from a player response. */
function buildOptions(data: any, id: string): DownloadOption[] {
  const prog: YtFormat[] = data?.streamingData?.formats ?? [];
  const adap: YtFormat[] = data?.streamingData?.adaptiveFormats ?? [];

  const progByItag = new Map<number, YtFormat>();
  for (const f of prog) {
    if (typeof f?.url === "string" && f.itag != null) progByItag.set(f.itag, f);
  }
  const adapByItag = new Map<number, YtFormat>();
  for (const f of adap) {
    if (typeof f?.url === "string" && f.itag != null) adapByItag.set(f.itag, f);
  }

  // Best available AAC audio track.
  let audio: YtFormat | undefined;
  for (const it of AUDIO_ITAGS) {
    if (adapByItag.has(it)) {
      audio = adapByItag.get(it);
      break;
    }
  }
  const audioProxy = audio?.url
    ? proxy(audio.url, `ssdown-youtube-${id}-audio.m4a`)
    : "";

  const items: DownloadOption[] = [];
  const seen = new Set<string>();

  // 1) Progressive single-file (preferred per resolution).
  for (const p of PROGRESSIVE) {
    const f = progByItag.get(p.itag);
    if (f?.url) {
      items.push({
        quality: p.quality,
        content_type: "video/mp4",
        kind: "progressive",
        url: proxy(f.url, `ssdown-youtube-${id}-${p.quality}.mp4`),
      });
      seen.add(p.quality);
    }
  }

  // 2) Merge (video-only H.264 + AAC audio) for resolutions not already covered.
  if (audio?.url) {
    for (const m of MERGE_VIDEO) {
      if (seen.has(m.quality)) continue;
      const v = adapByItag.get(m.itag);
      if (v?.url && (v.mimeType ?? "").includes("avc1")) {
        items.push({
          quality: m.quality,
          content_type: "video/mp4",
          kind: "merge",
          url: "",
          videoUrl: proxy(v.url, `ssdown-youtube-${id}-${m.quality}-video.mp4`),
          audioUrl: audioProxy,
        });
        seen.add(m.quality);
      }
    }
  }

  // Sort video options by resolution descending (1080 > 720 > 480 > 360).
  const rank = (q: string) => parseInt(q, 10) || 0;
  items.sort((a, b) => rank(b.quality) - rank(a.quality));

  // 3) Audio-only at the end.
  if (audio?.url) {
    items.push({
      quality: "Audio (M4A)",
      content_type: "audio/mp4",
      kind: "audio",
      url: audioProxy,
    });
  }

  return items;
}

const DOWNLOAD_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** A representative raw stream URL from a player response, for the probe. */
function probeUrl(data: any): string | null {
  const adap: YtFormat[] = data?.streamingData?.adaptiveFormats ?? [];
  const prog: YtFormat[] = data?.streamingData?.formats ?? [];
  const f = [...adap, ...prog].find((x) => typeof x?.url === "string");
  return f?.url ?? null;
}

/**
 * Verify a stream is actually downloadable. PO-token-gated URLs (e.g. the iOS
 * client) 403 any sizeable Range — they only dribble out a tiny initial window —
 * whereas a healthy ANDROID_VR URL serves a full ~1 MB mid-file chunk (206).
 * We request such a chunk but only read the status code, then cancel the body,
 * so the probe costs essentially no bandwidth.
 */
async function isDownloadable(rawUrl: string): Promise<boolean> {
  try {
    const clen = Number(new URL(rawUrl).searchParams.get("clen") || "0");
    const lo = clen > 3_000_000 ? Math.floor(clen / 2) : 0;
    const hi = clen > 0 ? Math.min(lo + 1_048_575, clen - 1) : 1_048_575;
    const res = await fetchWithTimeout(
      rawUrl,
      { headers: { "User-Agent": DOWNLOAD_UA, Range: `bytes=${lo}-${hi}` } },
      8_000,
    );
    const ok = res.status === 206 || res.status === 200;
    try {
      await res.body?.cancel();
    } catch {
      /* ignore */
    }
    return ok;
  } catch {
    return false;
  }
}

function bestThumbnail(data: any, id: string): string {
  const thumbs: { url: string; width?: number }[] =
    data?.videoDetails?.thumbnail?.thumbnails ?? [];
  if (thumbs.length) {
    const sorted = [...thumbs].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
    return sorted[0].url;
  }
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function softError(message: string) {
  // status 200 + error so the shared client surfaces the message cleanly.
  return NextResponse.json({ error: "no_video", message }, { status: 200 });
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    const id = getYoutubeId(url);
    if (!id) {
      return NextResponse.json(
        { error: "Invalid URL", message: "Could not parse a YouTube video ID." },
        { status: 400 },
      );
    }

    // ANDROID_VR first (it can return progressive single-file MP4 and its
    // stream URLs are not PO-token-gated), then the iOS fallback. We only accept
    // a client whose streams actually download (probe) — iOS URLs are often
    // gated (serve only the first chunk), which would corrupt a download.
    let data: any = null;
    let options: DownloadOption[] = [];
    let botWalled = false;
    let gated = false;
    let unplayableReason = "";
    for (const key of ["android_vr", "ios"] as ClientKey[]) {
      try {
        const d = await fetchPlayer(id, key);
        const status = d?.playabilityStatus?.status;
        const reason =
          d?.playabilityStatus?.reason ||
          d?.playabilityStatus?.messages?.[0] ||
          "";
        if (status === "OK") {
          const opts = buildOptions(d, id);
          if (opts.length > 0) {
            const raw = probeUrl(d);
            if (raw && (await isDownloadable(raw))) {
              data = d;
              options = opts;
              break;
            }
            gated = true; // playable, but the streams are PO-token-gated
          }
        } else if (/sign in|confirm|not a bot|login/i.test(`${status} ${reason}`)) {
          botWalled = true;
        } else {
          unplayableReason = reason || status || "Video is not playable.";
        }
      } catch {
        // Network/transport failure on this client — try the next one.
      }
    }

    if (!data) {
      let message: string;
      if (botWalled || gated) {
        message =
          "YouTube is requiring sign-in verification to download this video right now, so it can't be fetched automatically. This usually clears up shortly — please try again later or try a different video.";
      } else if (unplayableReason) {
        message = unplayableReason;
      } else {
        message =
          "No downloadable stream is available for this video (it may be private, age-restricted, region-locked, or members-only).";
      }
      return softError(message);
    }

    const details = data.videoDetails ?? {};
    const micro = data.microformat?.playerMicroformatRenderer ?? {};

    const result = {
      type: "yt",
      id,
      user: {
        name: details.author || micro.ownerChannelName || "YouTube",
        screenName: details.channelId || "",
        // The player endpoint does not expose a channel avatar; reuse the video
        // thumbnail so the UI never renders a broken <Image>.
        avatar: bestThumbnail(data, id),
      },
      content: details.title || micro.title?.simpleText || "",
      thumbnail: bestThumbnail(data, id),
      videoItems: options,
      stats: {
        viewCount: Number(details.viewCount || micro.viewCount || 0),
        favoriteCount: 0,
        shareCount: 0,
        replyCount: 0,
        quoteCount: 0,
      },
      createdAt: micro.publishDate || micro.uploadDate || "",
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/yt:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 200 },
    );
  }
}
