import { NextRequest, NextResponse } from "next/server";

// NOTE: Do NOT set `export const runtime = "edge"`. This app deploys via
// @opennextjs/cloudflare, where edge-runtime API routes crash with a 500
// "Internal Server Error"; the default Node.js Workers runtime is required.
// This route only uses fetch + Web APIs, so it runs fine on Node.

/**
 * YouTube single-video downloader (fetch-only, no yt-dlp).
 *
 * Strategy (see research notes): YouTube's WEB client returns signatureCipher +
 * n-throttle + SABR formats that are impossible to resolve without a JS player.
 * The ANDROID_VR InnerTube client is the one client that is both
 * REQUIRE_JS_PLAYER=False (plain, ready-to-use `url`) AND PO-token-free — it is
 * yt-dlp's own no-JS default. We only ever serve PROGRESSIVE (muxed avc1+mp4a)
 * MP4 formats from `streamingData.formats[]` (itag 22 → 720p, itag 18 → 360p),
 * because higher resolutions are adaptive (video-only) and cannot be muxed at
 * the edge. This mirrors down.js's "H.264 + AAC mp4 for max compatibility".
 *
 * Quality ceiling is effectively 360p (720p best-effort). Datacenter-IP bot
 * walls (Cloudflare egress) are the dominant production failure and are handled
 * by surfacing a clear error rather than a broken download.
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
    // Bare 11-char video id?
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
  signatureCipher?: string;
  cipher?: string;
  width?: number;
  height?: number;
  contentLength?: string;
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

  const res = await fetch(PLAYER_URL, {
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
  });

  if (!res.ok) {
    throw new Error(`Player request failed (${key}): HTTP ${res.status}`);
  }
  return res.json();
}

/** Pick progressive (muxed) MP4 formats that carry a plain, ready-to-use url. */
function pickProgressive(data: any): {
  format: YtFormat;
  quality: string;
}[] {
  const formats: YtFormat[] = data?.streamingData?.formats ?? [];
  const out: { format: YtFormat; quality: string }[] = [];

  // Prefer 720p (itag 22) then 360p (itag 18); only entries with a plain `url`.
  const byItag = new Map<number, YtFormat>();
  for (const f of formats) {
    if (typeof f?.url === "string" && f.itag != null) byItag.set(f.itag, f);
  }

  const ranked: { itag: number; quality: string }[] = [
    { itag: 22, quality: "720p" },
    { itag: 18, quality: "360p" },
  ];
  for (const r of ranked) {
    const f = byItag.get(r.itag);
    if (f) out.push({ format: f, quality: r.quality });
  }

  // Defensive: include any other progressive mp4 with a plain url + qualityLabel.
  if (out.length === 0) {
    for (const f of formats) {
      if (
        typeof f?.url === "string" &&
        (f.mimeType ?? "").includes("mp4") &&
        f.qualityLabel
      ) {
        out.push({ format: f, quality: f.qualityLabel });
      }
    }
  }
  return out;
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

    // Try the no-JS, token-free client first, then the iOS fallback.
    let data: any = null;
    let botWalled = false; // a client returned LOGIN_REQUIRED / bot wall
    let okButNoProgressive = false; // playable, but only adaptive (un-muxable) streams
    let unplayableReason = ""; // UNPLAYABLE / ERROR reason from YouTube
    for (const key of ["android_vr", "ios"] as ClientKey[]) {
      try {
        const d = await fetchPlayer(id, key);
        const status = d?.playabilityStatus?.status;
        const reason =
          d?.playabilityStatus?.reason ||
          d?.playabilityStatus?.messages?.[0] ||
          "";
        if (status === "OK") {
          if (pickProgressive(d).length > 0) {
            data = d;
            break;
          }
          okButNoProgressive = true;
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
      if (okButNoProgressive) {
        message =
          "No downloadable MP4 is available for this video — YouTube only provides it as separate video and audio streams, which can't be combined here. Try another video.";
      } else if (botWalled) {
        message =
          "YouTube is temporarily blocking automated requests for this video. Please try again in a little while.";
      } else {
        message =
          unplayableReason ||
          "This video can't be downloaded (it may be private, age-restricted, region-locked, or members-only).";
      }
      return softError(message);
    }

    const picks = pickProgressive(data);
    const details = data.videoDetails ?? {};
    const micro = data.microformat?.playerMicroformatRenderer ?? {};

    const videoItems = picks.map(({ format, quality }) => {
      const fileName = `ssdown-youtube-${id}-${quality}.mp4`;
      const proxyUrl = `/api/yt/download?videoUrl=${encodeURIComponent(
        format.url as string,
      )}&filename=${encodeURIComponent(fileName)}`;
      return {
        url: proxyUrl,
        content_type: "video/mp4",
        quality,
        bitrate: format.bitrate ?? 0,
      };
    });

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
      videoItems,
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
