import { NextRequest, NextResponse } from "next/server";

const MOBILE_UA =
  "com.ss.android.ugc.aweme/110101 (Linux; U; Android 10; en_US; Pixel 4; Build/QQ3A.200805.001; Cronet/58.0.2991.0)";

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const modalId = parsed.searchParams.get("modal_id");
    if (modalId) return modalId;
    const match = parsed.pathname.match(/\/video\/(\d+)/);
    if (match) return match[1];
  } catch {}
  return null;
}

function qualityLabel(gearName: string): string {
  const m = gearName.match(/(\d+)p?/i) || gearName.match(/normal_(\d+)/);
  if (m) return `${m[1]}p`;
  return gearName;
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Could not extract video ID from URL" },
        { status: 400 },
      );
    }

    // Douyin 모바일 API — a_bogus/msToken 불필요
    const apiUrl = `https://api.amemv.com/aweme/v1/feed/?aweme_id=${videoId}&version_code=110101&app_name=aweme&channel=googleplay&device_type=Pixel+4&os_version=10`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": MOBILE_UA,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    const aweme = data?.aweme_list?.[0];

    if (!aweme) {
      return NextResponse.json(
        { error: "Video not found", message: "No aweme in response" },
        { status: 404 },
      );
    }

    const bitRateList: any[] = aweme.video?.bit_rate ?? [];
    console.error("[douyin] bit_rate sample:", JSON.stringify(bitRateList[0]));

    const videoItems = bitRateList
      .map((br: any) => {
        const urls: string[] = br.play_addr?.url_list ?? [];
        const cdnUrl = urls[0] ?? null;
        const directUrl = urls[2] ?? null;
        if (!cdnUrl) return null;
        const height: number = br.play_addr?.height ?? 0;
        const width: number = br.play_addr?.width ?? 0;
        const dim = Math.max(height, width);
        let quality: string;
        if (dim >= 1080) quality = "1080p";
        else if (dim >= 720) quality = "720p";
        else if (dim >= 540) quality = "540p";
        else if (dim >= 480) quality = "480p";
        else if (dim > 0) quality = `${dim}p`;
        else quality = qualityLabel(br.gear_name ?? "");
        return {
          url: directUrl ?? cdnUrl,
          cdnUrl,
          directUrl,
          content_type: "video/mp4",
          bitrate: br.bit_rate,
          quality,
        };
      })
      .filter(Boolean);

    const result = {
      type: "douyin",
      id: aweme.aweme_id,
      user: {
        name: aweme.author?.nickname ?? "",
        screenName: aweme.author?.unique_id ?? aweme.author?.short_id ?? "",
        avatar: aweme.author?.avatar_thumb?.url_list?.[0] ?? "",
      },
      content: aweme.desc,
      thumbnail:
        aweme.video?.origin_cover?.url_list?.[0] ??
        aweme.video?.cover?.url_list?.[0] ??
        "",
      videoItems,
      stats: {
        favoriteCount: aweme.statistics?.digg_count ?? 0,
        shareCount: aweme.statistics?.share_count ?? 0,
        replyCount: aweme.statistics?.comment_count ?? 0,
        quoteCount: 0,
        viewCount: aweme.statistics?.play_count ?? 0,
      },
      createdAt: aweme.create_time
        ? new Date(aweme.create_time * 1000).toISOString()
        : new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/douyin:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
