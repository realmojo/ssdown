import { NextRequest, NextResponse } from "next/server";

/**
 * Instagram URL에서 reel ID를 추출하는 함수
 * @param url Instagram reel URL
 * @returns reel ID 또는 null
 *
 * 지원하는 URL 형식:
 * - https://9gag.com/gag/aNDGXAw
 * - https://9gag.com/gag/aNDGXAw?dfdfdf
 */
const extractGagId = (url: string): string | null => {
  try {
    // 정규식으로 /reel/ 다음의 ID 추출
    const gagMatch = url.match(/\/gag\/([^/?]+)/);
    if (gagMatch && gagMatch[1]) {
      return gagMatch[1];
    }

    // 정규식이 실패한 경우 대체 방법: URL 파싱
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    // pathname이 /reel/ID 형식인 경우
    const gagIndex = pathParts.indexOf("gag");
    if (gagIndex !== -1 && gagIndex + 1 < pathParts.length) {
      return pathParts[gagIndex + 1];
    }

    return null;
  } catch (error) {
    console.error("Error extracting gag ID:", error);
    return null;
  }
};

const get9gagDetailInfo = async (gagId: string) => {
  try {
    const url = `https://9gag.com/gag/${gagId}?utm_source=copy_link`;

    const headers = {
      Cookie: "____lo=KR; ____ri=270",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "ko-KR,ko;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Referer: "https://9gag.com/",
      "Sec-Ch-Ua":
        '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Viewport-Width": "472",
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error(`Failed to fetch 9gag page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // HTML이 제대로 파싱되는지 확인 (바이너리가 아닌 텍스트인지)
    return html;
  } catch (error: any) {
    console.error("Error fetching 9gag detail info:", error);
    return null;
  }
};

/**
 * HTML에서 window._config = JSON.parse(...) 부분의 JSON 데이터를 추출하는 함수
 * @param html HTML 문자열
 * @returns 파싱된 JSON 객체
 */
const extractScriptJson = (html: string): any => {
  try {
    // window._config = JSON.parse("...") 패턴 찾기
    // 이스케이프된 따옴표를 포함한 문자열을 정확히 추출하기 위한 정규식
    const regex = /window\._config\s*=\s*JSON\.parse\("((?:[^"\\]|\\.)*)"\)/;
    const match = html.match(regex);

    if (!match || !match[1]) {
      console.error("Could not find window._config pattern");
      return null;
    }

    // 추출한 문자열은 JavaScript 문자열 리터럴로 이스케이프되어 있으므로,
    // 올바른 순서로 이스케이프를 해제해야 함
    // 순서가 중요: 먼저 \\ 처리, 그 다음 다른 이스케이프
    const jsonString = match[1]
      .replace(/\\\\/g, "\u0001") // \\ -> 임시 마커 (나중에 \로 복원)
      .replace(/\\"/g, '"') // \" -> "
      .replace(/\\n/g, "\n") // \n -> 실제 줄바꿈
      .replace(/\\r/g, "\r") // \r -> 실제 캐리지 리턴
      .replace(/\\t/g, "\t") // \t -> 실제 탭
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      ) // \uXXXX -> 유니코드 문자
      .replace(/\u0001/g, "\\"); // 임시 마커 -> \

    const parsed = JSON.parse(jsonString);
    return parsed.data || null;
  } catch (error) {
    console.error("Error extracting script JSON:", error);
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

    // URL에서 reel ID 추출
    const gagId = extractGagId(url);

    if (!gagId) {
      return NextResponse.json(
        { error: "Invalid URL", message: "Could not extract gag ID from URL" },
        { status: 400 },
      );
    }

    const html = await get9gagDetailInfo(gagId);

    if (!html) {
      return NextResponse.json(
        { error: "no data", message: "Could not fetch 9gag detail info" },
        { status: 200 },
      );
    }

    // HTML에서 video_versions 필드가 있는 스크립트 태그의 JSON 추출
    const data = extractScriptJson(html);

    if (!data) {
      return NextResponse.json(
        { error: "no data", message: "Could not extract 9gag data" },
        { status: 200 },
      );
    }

    if (all) {
      return NextResponse.json(data, { status: 200 });
    }

    const post = data?.post || {};

    const result = {
      type: "9gag",
      id: gagId,
      user: {
        name: post?.creator?.username || "",
        screenName: post?.creator?.fullName || "",
        avatar: post?.creator?.avatarUrl || "",
      },
      content: post?.title || "",
      thumbnail:
        post?.images?.image700?.url ||
        post?.images?.image460?.url ||
        post?.images?.imageFbThumbnail?.url ||
        "",
      videoItems: [
        {
          url: post?.images?.image460sv?.url || "",
          content_type: "video/mp4",
          bitrate: 0,
          quality: "720p",
        },
        {
          url:
            post?.images?.image460sv?.vp8Url ||
            post?.images?.image460sv?.h265Url ||
            post?.images?.image460sv?.av1Url ||
            post?.images?.image460sv?.vp9Url ||
            "",
          content_type: "video/mp4",
          bitrate: 0,
          quality: "480p",
        },
      ],
      stats: {
        favoriteCount: post?.upVoteCount || 0,
        shareCount: post?.downVoteCount || 0,
        replyCount: post?.commentsCount || 0,
        quoteCount: 0,
        viewCount: post?.viewCount || 0,
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/x:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 200 },
    );
  }
}
