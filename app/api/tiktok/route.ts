import { NextRequest, NextResponse } from "next/server";

// set-cookie 헤더에서 tt_chain_token 추출
const getTtChainToken = (response: Response): string | null => {
  const cookies = response.headers.get("set-cookie");

  if (!cookies) {
    return null;
  }

  // set-cookie 헤더는 여러 쿠키가 쉼표로 구분된 문자열
  // tt_chain_token=값; attributes 형식에서 값을 추출
  const match = cookies.match(/tt_chain_token=([^;]+)/);

  if (!match || !match[1]) {
    return null;
  }

  return match[1];
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    // const tiktokId = url.split("/")[url.split("/").length - 1];

    // TikWM API 사용 (무료 공용 API)
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log("response", response);

      const ttChainToken = getTtChainToken(response);
      console.log("ttChainToken", ttChainToken);

      if (data.code !== 0) {
        console.error("TikWM API error:", data);
        return NextResponse.json(
          { error: "Failed to fetch video data", message: data.msg },
          { status: 400 },
        );
      }

      const videoData = data.data;

      const result = {
        type: "tiktok",
        id: videoData.id,
        user: {
          name: videoData.author.nickname,
          screenName: videoData.author.unique_id,
          avatar: videoData.author.avatar,
        },
        content: videoData.title,
        thumbnail: videoData.cover,
        videoItems: [
          {
            url: videoData.play, // No watermark
            content_type: "video/mp4",
            bitrate: 0,
            quality: "HD (No Watermark)",
          },
          {
            url: videoData.wmplay, // With watermark
            content_type: "video/mp4",
            bitrate: 0,
            quality: "Original (Watermarked)",
          },
        ].filter((item) => item.url),
        stats: {
          favoriteCount: videoData.digg_count,
          shareCount: videoData.share_count,
          replyCount: videoData.comment_count,
          quoteCount: 0,
          viewCount: videoData.play_count,
        },
        createdAt: new Date(videoData.create_time * 1000).toISOString(),
      };

      return NextResponse.json(result, { status: 200 });
    } catch (apiError) {
      console.error("TikWM API fetch error:", apiError);
      // Remove or comment out ttChainToken usage if it exists outside
      return NextResponse.json(
        { error: "API Error", message: "Failed to connect to TikWM API" },
        { status: 500 },
      );
    }
  } catch (e: any) {
    console.error("Error in GET /api/tiktok:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
