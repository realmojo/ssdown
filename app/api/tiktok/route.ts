import { NextRequest, NextResponse } from "next/server";
import { getQualityForBitrate } from "@/lib/utils";

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
    const all = searchParams.get("all") === "true";

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    const tiktokId = url.split("/")[url.split("/").length - 1];

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: "https://www.tiktok.com/",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch TikTok page: ${response.status} ${response.statusText}`
      );
    }

    const ttChainToken = getTtChainToken(response);
    const html = await response.text();

    // __UNIVERSAL_DATA_FOR_REHYDRATION__ 스크립트 태그에서 JSON 추출
    const scriptRegex =
      /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/;
    const match = html.match(scriptRegex);

    if (!match || !match[1]) {
      return NextResponse.json(
        {
          error: "Could not find __UNIVERSAL_DATA_FOR_REHYDRATION__ script tag",
        },
        { status: 200 }
      );
    }

    try {
      // JSON 파싱
      const jsonData = JSON.parse(match[1]);
      const data = jsonData.__DEFAULT_SCOPE__["webapp.video-detail"];

      if (all) {
        return NextResponse.json(data, { status: 200 });
      }

      // TikTok 데이터 추출
      const itemStruct = data?.itemInfo?.itemStruct || {};
      const author = itemStruct.author || {};
      const video = itemStruct.video || {};
      const stats = itemStruct.stats || {};

      // 사용자 정보 추출
      const rawUserName = author.nickname || "";
      // 이모지 제거
      const userName = rawUserName
        .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, "") // 이모지 제거
        .replace(/[^\w\s]/g, "")
        .trim();
      const userScreenName = author.uniqueId || "";
      const userAvatar = author.avatarLarger || "";

      // 트윗 정보 추출
      const content = itemStruct.desc || "";
      const createdAt = itemStruct.createTime
        ? new Date(parseInt(itemStruct.createTime) * 1000).toISOString()
        : "";
      const thumbnail = video.cover || "";
      const favoriteCount = parseInt(String(stats.diggCount)) || 0;
      const shareCount = parseInt(String(stats.shareCount)) || 0;
      const replyCount = parseInt(String(stats.commentCount)) || 0;
      const quoteCount = 0; // TikTok에는 quoteCount가 없음
      const viewCount = parseInt(String(stats.playCount)) || 0;

      // 비디오 정보 추출
      let videoItems: Array<{
        url: string;
        content_type: string;
        bitrate: string;
      }> = [];

      if (video.bitrateInfo && Array.isArray(video.bitrateInfo)) {
        videoItems = video.bitrateInfo
          .filter(
            (item: any) =>
              item.PlayAddr?.UrlList && item.PlayAddr.UrlList.length > 0
          )
          .map((item: any) => {
            const bitrate = item.Bitrate || 0;
            const url = item.PlayAddr.UrlList[0] || "";
            const content_type = video.format || "video/mp4";

            return {
              url: encodeURIComponent(`${url}&tt_chain_token=${ttChainToken}`),
              content_type,
              bitrate: getQualityForBitrate(bitrate),
            };
          });
      }

      // X 형식과 동일하게 반환
      const result = {
        type: "tiktok",
        id: itemStruct.id || tiktokId,
        user: {
          name: userName,
          screenName: userScreenName,
          avatar: userAvatar,
        },
        content,
        thumbnail,
        videoItems,
        stats: {
          favoriteCount,
          shareCount,
          replyCount,
          quoteCount,
          viewCount: Number(viewCount),
        },
        createdAt,
        tt_chain_token: ttChainToken,
      };

      return NextResponse.json(result, { status: 200 });
    } catch (parseError: any) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse JSON", message: parseError?.message },
        { status: 200 }
      );
    }
  } catch (e: any) {
    console.error("Error in GET /api/tiktok:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 200 }
    );
  }
}
