import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

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
      `Failed to fetch Instagram page: ${response.status} ${response.statusText}`,
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
 * carousel_media 안에 여러 개의 video_versions가 있는 경우도 처리합니다.
 * @param obj 확인할 객체
 * @returns video_versions 필드가 있는 객체 배열
 */
const findObjectsWithVideoVersions = (obj: any): any[] => {
  const results: any[] = [];

  if (!obj || typeof obj !== "object") {
    return results;
  }

  // 현재 객체에 video_versions 필드가 있는지 확인
  if (
    obj.hasOwnProperty("video_versions") &&
    Array.isArray(obj.video_versions)
  ) {
    results.push(obj);
  }

  // carousel_media가 있는 경우 모든 항목을 수집하고 상위 객체의 정보를 병합
  if (
    obj.hasOwnProperty("carousel_media") &&
    Array.isArray(obj.carousel_media)
  ) {
    for (const mediaItem of obj.carousel_media) {
      if (
        mediaItem &&
        mediaItem.hasOwnProperty("video_versions") &&
        Array.isArray(mediaItem.video_versions)
      ) {
        // 상위 객체의 정보를 병합
        const mergedItem = {
          ...mediaItem,
          // 상위 객체의 user 정보가 있으면 사용
          user: obj.user || mediaItem.user,
          // 상위 객체의 통계 정보가 있으면 사용
          like_count:
            obj.like_count !== undefined
              ? obj.like_count
              : mediaItem.like_count,
          shares_count:
            obj.shares_count !== undefined
              ? obj.shares_count
              : mediaItem.shares_count,
          comment_count:
            obj.comment_count !== undefined
              ? obj.comment_count
              : mediaItem.comment_count,
          quotes_count:
            obj.quotes_count !== undefined
              ? obj.quotes_count
              : mediaItem.quotes_count,
          view_count:
            obj.view_count !== undefined
              ? obj.view_count
              : mediaItem.view_count,
          // 상위 객체의 caption이 있으면 사용
          caption: obj.caption || mediaItem.caption,
          // 상위 객체의 image_versions2가 없으면 mediaItem의 것을 사용
          // image_versions2: obj.image_versions2 || mediaItem.image_versions2,
        };
        results.push(mergedItem);
      }
    }
  }

  // 배열인 경우 각 요소를 재귀적으로 탐색
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const nestedResults = findObjectsWithVideoVersions(item);
      results.push(...nestedResults);
    }
  } else {
    // 객체인 경우 각 속성을 재귀적으로 탐색
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const nestedResults = findObjectsWithVideoVersions(obj[key]);
        results.push(...nestedResults);
      }
    }
  }

  return results;
};

/**
 * HTML에서 data-sjs 속성이 있는 스크립트 태그의 JSON 데이터를 추출하는 함수
 * video_versions 필드가 있는 객체만 추출합니다.
 * carousel_media 안에 여러 개의 video_versions가 있는 경우도 처리합니다.
 * @param html HTML 문자열
 * @returns video_versions 필드가 있는 파싱된 JSON 객체 (carousel_media가 있으면 첫 번째 항목 또는 메인 객체)
 */
const extractScriptJson = (html: string): any => {
  try {
    // data-sjs 속성이 있는 script 태그 찾기
    const scriptRegex =
      /<script[^>]*type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g;
    const allVideoObjects: any[] = [];
    let match;

    while ((match = scriptRegex.exec(html)) !== null) {
      const jsonContent = match[1].trim();

      try {
        const parsed = JSON.parse(jsonContent);

        // video_versions 필드가 있는 모든 객체 찾기 (carousel_media 포함)
        const videoObjects = findObjectsWithVideoVersions(parsed);
        allVideoObjects.push(...videoObjects);
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    }

    return allVideoObjects;
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
    const reelId = extractReelId(url);

    if (!reelId) {
      return NextResponse.json(
        { error: "Invalid URL", message: "Could not extract reel ID from URL" },
        { status: 400 },
      );
    }

    const html = await getInstagramDetailInfo(reelId);

    // HTML에서 video_versions 필드가 있는 스크립트 태그의 JSON 추출
    const data = extractScriptJson(html);

    // pk 값이 중복되는 경우 제거
    const uniqueData = data.filter(
      (item: any, index: number, self: any[]) =>
        index === self.findIndex((t) => t.pk === item.pk),
    );

    if (!data) {
      return NextResponse.json(
        { error: "no data", message: "Could not extract instagram data" },
        { status: 200 },
      );
    }

    if (all) {
      return NextResponse.json(data, { status: 200 });
    }

    const results = uniqueData.map((item: any) => {
      return {
        type: "instagram",
        id: reelId,
        user: {
          name: item?.user?.full_name || "",
          screenName: item?.user?.username || "",
          avatar: item?.user?.profile_pic_url || "",
        },
        content: item?.caption?.text || "",
        thumbnail: item?.image_versions2?.candidates[0]?.url || "",
        videoItems: item?.video_versions?.map((video: any, index: number) => {
          return {
            url: video?.url || "",
            content_type: video?.content_type || "",
            bitrate: video?.bitrate || "",
            quality: index === 0 ? "720p" : index === 1 ? "480p" : "360p",
          };
        }),
        stats: {
          favoriteCount: item?.like_count || 0,
          shareCount: item?.shares_count || 0,
          replyCount: item?.comment_count || 0,
          quoteCount: item?.quotes_count || 0,
          viewCount: item?.view_count || 0,
        },
        createdAt: item?.caption?.created_at
          ? new Date(item?.caption?.created_at * 1000).toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json(results, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/x:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 200 },
    );
  }
}
