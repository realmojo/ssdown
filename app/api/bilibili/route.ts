import { NextRequest, NextResponse } from "next/server";

/**
 * Bilibili URL에서 video ID를 추출하는 함수
 * @param url Bilibili video URL
 * @returns video ID 또는 null
 *
 * 지원하는 URL 형식:
 * - https://www.bilibili.com/video/BV1J7mqBpEMQ/?spm_id_from=333.1007.tianma.5-1-14.click
 * - https://www.bilibili.com/video/BV1J7mqBpEMQ/
 */
const extractVideoId = (url: string): string | null => {
  try {
    // 정규식으로 /reel/ 다음의 ID 추출
    const videoMatch = url.match(/\/video\/([^/?]+)/);
    if (videoMatch && videoMatch[1]) {
      return videoMatch[1];
    }

    // 정규식이 실패한 경우 대체 방법: URL 파싱
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    // pathname이 /reel/ID 형식인 경우
    const videoIndex = pathParts.indexOf("video");
    if (videoIndex !== -1 && videoIndex + 1 < pathParts.length) {
      return pathParts[videoIndex + 1];
    }

    return null;
  } catch (error) {
    console.error("Error extracting video ID:", error);
    return null;
  }
};

const getBilibiliDetailInfo = async (videoId: string) => {
  const url = `https://www.bilibili.com/video/${videoId}/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "accept-language": "ko-KR,ko;q=0.9",
      "cache-control": "no-cache",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Bilibili page: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();

  if (html.length === 0) {
    throw new Error("Received empty response");
  }

  return html;
};

/**
 * HTML에서 window.__playinfo__ 객체를 추출하는 함수
 * @param html HTML 문자열
 * @returns 파싱된 JSON 객체
 */
const extractScriptJson = (html: string): any => {
  try {
    // window.__playinfo__ = {...} 패턴 찾기
    // 여러 가지 패턴 시도:
    // 1. window.__playinfo__ = {...}
    // 2. window.__playinfo__={...}
    // 3. <script>window.__playinfo__ = {...}</script>

    // 가장 일반적인 패턴: window.__playinfo__ = {...}
    const patterns = [
      /window\.__playinfo__\s*=\s*({[\s\S]*?});/,
      /window\.__playinfo__\s*=\s*({[\s\S]*?})(?:\s*;|\s*<\/script>)/,
      /window\.__playinfo__\s*=\s*({[\s\S]*?})(?:\s*;|\s*$)/m,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          const jsonString = match[1].trim();
          const parsed = JSON.parse(jsonString);
          return parsed;
        } catch (e) {
          console.error("Error parsing __playinfo__ JSON:", e);
          // JSON 파싱 실패 시 다음 패턴 시도
          continue;
        }
      }
    }

    // 패턴을 찾지 못한 경우, 더 넓은 범위로 검색
    const broadPattern =
      /window\.__playinfo__\s*=\s*({[\s\S]{1,500000}?})(?:\s*;|\s*<\/script>|\s*$)/m;
    const broadMatch = html.match(broadPattern);

    if (broadMatch && broadMatch[1]) {
      try {
        // JSON 문자열 정리 (주석 제거, 마지막 쉼표 제거 등)
        let jsonString = broadMatch[1].trim();

        // 불필요한 주석 제거 (JSON은 주석을 지원하지 않음)
        jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, "");
        jsonString = jsonString.replace(/\/\/.*$/gm, "");

        // 마지막 쉼표 제거 (배열/객체 마지막 요소 뒤)
        jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");

        const parsed = JSON.parse(jsonString);
        return parsed;
      } catch (parseError) {
        console.error("Error parsing __playinfo__ JSON:", parseError);
        return null;
      }
    }

    console.error("Could not find window.__playinfo__ pattern");
    return null;
  } catch (error) {
    console.error("Error extracting script JSON:", error);
    return null;
  }
};

const extractItemInfo = (html: string): any => {
  try {
    // window.__INITIAL_STATE__ =

    const patterns = [
      /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/,
      /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?})(?:\s*;|\s*<\/script>)/,
      /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?})(?:\s*;|\s*$)/m,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          const jsonString = match[1].trim();
          const parsed = JSON.parse(jsonString);
          return parsed;
        } catch (e) {
          console.error("Error parsing __INITIAL_STATE__ JSON:", e);
          // JSON 파싱 실패 시 다음 패턴 시도
          continue;
        }
      }
    }
    console.error("Could not find window.__INITIAL_STATE__ pattern");
    return null;
  } catch (error) {
    console.error("Error extracting item info:", error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const all = searchParams.get("all") === "true";

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    // URL에서 video ID 추출
    const videoId = extractVideoId(url);

    if (!videoId) {
      return NextResponse.json(
        {
          error: "Invalid URL",
          message: "Could not extract video ID from URL",
        },
        { status: 400 }
      );
    }

    const html = await getBilibiliDetailInfo(videoId);

    const itemInfo = extractItemInfo(html);
    const videoInfo = extractScriptJson(html);

    if (!itemInfo) {
      return NextResponse.json(
        { error: "no data", message: "Could not extract bilibili data" },
        { status: 200 }
      );
    }

    if (all) {
      return NextResponse.json(itemInfo, { status: 200 });
    }

    const result = {
      type: "bilibili",
      id: videoId,
      user: {
        name: itemInfo?.videoData?.owner?.name || "",
        screenName: itemInfo?.videoData?.owner?.name || "",
        avatar: itemInfo?.videoData?.owner?.face || "",
      },
      content: itemInfo?.videoData?.title || "",
      thumbnail: itemInfo?.videoData?.pic
        ? itemInfo?.videoData?.pic.replace("http://", "https://")
        : "",
      videoItems: [
        {
          url: videoInfo?.data?.dash?.video[0]?.baseUrl || "",
          content_type: "video/mp4",
          bitrate: 0,
          quality: "1080p",
        },
      ],
      stats: {
        favoriteCount: itemInfo?.videoData?.stat?.like || 0,
        shareCount: itemInfo?.videoData?.stat?.share || 0,
        replyCount: itemInfo?.videoData?.stat?.reply || 0,
        viewCount: itemInfo?.videoData?.stat?.view || 0,
      },
      createdAt: itemInfo?.videoData?.pubdate
        ? new Date(itemInfo?.videoData?.pubdate * 1000).toISOString()
        : new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/x:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 200 }
    );
  }
}
