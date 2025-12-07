import { NextRequest, NextResponse } from "next/server";

/**
 * Instagram URL에서 reel ID를 추출하는 함수
 * @param url Instagram reel URL
 * @returns reel ID 또는 null
 *
 * 지원하는 URL 형식:
 * - https://www.instagram.com/reel/DRzxg9KgC8A/?utm_source=ig_web_copy_link
 * - https://www.instagram.com/reel/DRzxg9KgC8A/
 * - https://www.instagram.com/reel/DRzxg9KgC8A
 * - https://www.instagram.com/p/DRzxg9KgC8A/
 */
const extractReelId = (url: string): string | null => {
  try {
    // 정규식으로 /reel/ 다음의 ID 추출
    const reelMatch =
      url.match(/\/reel\/([^/?]+)/) || url.match(/\/p\/([^/?]+)/);
    if (reelMatch && reelMatch[1]) {
      return reelMatch[1];
    }

    // 정규식이 실패한 경우 대체 방법: URL 파싱
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    // pathname이 /reel/ID 형식인 경우
    const reelIndex = pathParts.indexOf("reel") || pathParts.indexOf("p");
    if (reelIndex !== -1 && reelIndex + 1 < pathParts.length) {
      return pathParts[reelIndex + 1];
    }

    return null;
  } catch (error) {
    console.error("Error extracting reel ID:", error);
    return null;
  }
};

const getInstagramDetailInfo = async (reelId: string) => {
  const url = `https://www.instagram.com/reel/${reelId}/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      // accept-encoding 제거: Node.js fetch가 자동으로 압축을 처리하지만
      // br, zstd 등은 지원하지 않을 수 있으므로 명시적으로 제거
      // "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "ko-KR,ko;q=0.9",
      "cache-control": "no-cache",
      cookie:
        "csrftoken=_bJipQ7ReUTand8xB1CyXX; datr=CfA0adkcaHUvAyXR1WuF52vf; ig_did=78A725BE-60B5-4202-9E32-DCE8F77FC7BD; ig_nrcb=1; mid=aTTwCQAEAAGyk-99ATQSFePpnpck; wd=472x962",
      dpr: "2",
      pragma: "no-cache",
      priority: "u=0, i",
      "sec-ch-prefers-color-scheme": "dark",
      "sec-ch-ua":
        '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
      "sec-ch-ua-full-version-list":
        '"Chromium";v="142.0.7444.176", "Google Chrome";v="142.0.7444.176", "Not_A Brand";v="99.0.0.0"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": '""',
      "sec-ch-ua-platform": '"macOS"',
      "sec-ch-ua-platform-version": '"26.0.1"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "viewport-width": "472",
    },
  });
  // Response 헤더 확인
  // const contentType = response.headers.get("content-type");
  // const contentEncoding = response.headers.get("content-encoding");

  // console.log("Content-Type:", contentType);
  // console.log("Content-Encoding:", contentEncoding);
  // console.log("Response Status:", response.status, response.statusText);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Instagram page: ${response.status} ${response.statusText}`
    );
  }

  // 텍스트로 변환 (Node.js fetch는 gzip/deflate를 자동으로 해제함)
  const html = await response.text();

  // HTML이 제대로 파싱되는지 확인 (바이너리가 아닌 텍스트인지)
  if (html.length === 0) {
    throw new Error("Received empty response");
  }

  return html;
};

/**
 * 객체 내에 video_versions 필드가 있는지 재귀적으로 확인하는 함수
 * @param obj 확인할 객체
 * @returns video_versions 필드가 있는 객체 또는 null
 */
const findObjectWithVideoVersions = (obj: any): any | null => {
  if (!obj || typeof obj !== "object") {
    return null;
  }

  // 현재 객체에 video_versions 필드가 있는지 확인
  if (
    obj.hasOwnProperty("video_versions") &&
    Array.isArray(obj.video_versions)
  ) {
    return obj;
  }

  // 배열인 경우 각 요소를 재귀적으로 탐색
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findObjectWithVideoVersions(item);
      if (result) {
        return result;
      }
    }
  } else {
    // 객체인 경우 각 속성을 재귀적으로 탐색
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const result = findObjectWithVideoVersions(obj[key]);
        if (result) {
          return result;
        }
      }
    }
  }

  return null;
};

/**
 * HTML에서 data-sjs 속성이 있는 스크립트 태그의 JSON 데이터를 추출하는 함수
 * video_versions 필드가 있는 객체만 추출합니다.
 * @param html HTML 문자열
 * @returns video_versions 필드가 있는 파싱된 JSON 객체 배열
 */
const extractScriptJson = (html: string): any => {
  try {
    // data-sjs 속성이 있는 script 태그 찾기
    const scriptRegex =
      /<script[^>]*type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g;
    const results: any[] = [];
    let match;

    while ((match = scriptRegex.exec(html)) !== null) {
      const jsonContent = match[1].trim();

      try {
        const parsed = JSON.parse(jsonContent);

        // video_versions 필드가 있는 객체 찾기
        const objectWithVideoVersions = findObjectWithVideoVersions(parsed);

        if (objectWithVideoVersions) {
          results.push(objectWithVideoVersions);
        }
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    }

    return results[0];
  } catch (error) {
    console.error("Error extracting script JSON:", error);
    return [];
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
    const reelId = extractReelId(url);

    if (!reelId) {
      return NextResponse.json(
        { error: "Invalid URL", message: "Could not extract reel ID from URL" },
        { status: 400 }
      );
    }

    const html = await getInstagramDetailInfo(reelId);

    // HTML에서 video_versions 필드가 있는 스크립트 태그의 JSON 추출
    const data = extractScriptJson(html);

    if (!data) {
      return NextResponse.json(
        { error: "no data", message: "Could not extract instagram data" },
        { status: 200 }
      );
    }

    if (all) {
      return NextResponse.json(data, { status: 200 });
    }

    const user = data?.user;
    const userName = user?.username || "";
    const userScreenName = user?.full_name || "";
    const userAvatar =
      user?.hd_profile_pic_url_info?.url || user?.profile_pic_url || "";
    const content = data?.caption?.text ?? "";
    const thumbnail = data?.image_versions2?.candidates?.[0]?.url ?? "";
    const videoItems = data?.video_versions.map((item: any, index: number) => {
      return {
        url: item.url,
        content_type: item.content_type,
        bitrate: item.bitrate,
        quality: index === 0 ? "720p" : index === 1 ? "480p" : "360p",
      };
    });
    const favoriteCount = data?.like_count || 0;
    const shareCount = data?.shares_count || 0;
    const replyCount = data?.comment_count || 0;
    const quoteCount = data?.quotes_count || 0;
    const viewCount = data?.view_count || 0;
    const createdAt = data?.caption?.created_at
      ? new Date(data.caption.created_at * 1000).toISOString()
      : new Date().toISOString();

    const result = {
      id: reelId,
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
        viewCount,
      },
      createdAt,
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
