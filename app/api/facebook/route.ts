import { NextRequest, NextResponse } from "next/server";

/**
 * Facebook URL에서 share ID를 추출하는 함수
 * @param url Facebook share URL
 * @returns share ID 또는 null
 *
 * 지원하는 URL 형식:
 * - https://www.facebook.com/share/v/1DAsbeynjY/
 */
const getShareFacebookId = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "ko-KR,ko;q=0.9",
        "cache-control": "no-cache",
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

    return response.url ?? "";
  } catch (error) {
    console.error("Error extracting share Facebook ID:", error);
    return null;
  }
};

/**
 * Instagram URL에서 reel ID를 추출하는 함수
 * @param url Instagram reel URL
 * @returns reel ID 또는 null
 *
 * 지원하는 URL 형식:
 *
 * - https://www.facebook.com/p/1577956663559515
 * - https://www.facebook.com/reel/1577956663559515
 * - https://www.facebook.com/watch/?v=1577956663559515
 */
const extractReelId = async (url: string): Promise<string | null> => {
  try {
    if (url.includes("share/v/")) {
      url = (await getShareFacebookId(url)) ?? "";
    }

    // 정규식으로 /reel/ 다음의 ID 추출
    const reelMatch =
      url.match(/\/reel\/([^/?]+)/) || url.match(/\/p\/([^/?]+)/);
    if (reelMatch && reelMatch[1]) {
      return reelMatch[1];
    }

    // URL 파싱
    const urlObj = new URL(url);

    // /watch/?v=ID 형식 처리
    if (urlObj.pathname === "/watch/" || urlObj.pathname === "/watch") {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return videoId;
      }
    }

    // pathname이 /reel/ID 형식인 경우
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
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

const getFacebookDetailInfo = async (reelId: string) => {
  const url = `https://www.facebook.com/reel/${reelId}/`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      // "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "cache-control": "max-age=0",
      cookie:
        "c_user=100002348649488; ps_l=1; ps_n=1; sb=3qZeaEMRzq9gPSvH-iYXY2zR; datr=hqBvaCZaHFgNuLlOnWPxpnS0; ar_debug=1; fr=1SysJccbImGwsosUC.AWeEorWc2ruR62iTvXDheECBzc5GGSLf1LLa-uUOn2edOhn_mKw.BpNS7b..AAA.0.0.BpNS7b.AWcmnkP8nZl9mcSrbV5ihpGolwA; xs=23%3AicwfV9E_C6spnQ%3A2%3A1649035660%3A-1%3A-1%3A%3AAcxIKs0_MeP7fjgKIaUHVF4XoTgzrBs4avTMWhhevPkg; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1765094454805%2C%22v%22%3A1%7D; wd=300x962",
      dpr: "2",
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
      "viewport-width": "300",
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
 * 객체 내에 downloadable_uri_hd 또는 downloadable_uri_sd 필드가 있는지 재귀적으로 확인하는 함수
 * Facebook 비디오는 downloadable_uri_hd와 downloadable_uri_sd를 사용합니다.
 * @param obj 확인할 객체
 * @returns downloadable_uri_hd 또는 downloadable_uri_sd 필드가 있는 객체 배열
 */
const findObjectsWithDownloadableUris = (obj: any): any[] => {
  const results: any[] = [];

  if (!obj || typeof obj !== "object") {
    return results;
  }

  // 현재 객체에 downloadable_uri_hd 또는 downloadable_uri_sd 필드가 있는지 확인
  if (
    (obj.hasOwnProperty("downloadable_uri_hd") && obj.downloadable_uri_hd) ||
    (obj.hasOwnProperty("downloadable_uri_sd") && obj.downloadable_uri_sd)
  ) {
    results.push(obj);
  }

  // 배열인 경우 각 요소를 재귀적으로 탐색
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const nestedResults = findObjectsWithDownloadableUris(item);
      results.push(...nestedResults);
    }
  } else {
    // 객체인 경우 각 속성을 재귀적으로 탐색
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const nestedResults = findObjectsWithDownloadableUris(obj[key]);
        results.push(...nestedResults);
      }
    }
  }

  return results;
};

/**
 * 객체 내에 name과 displayPicture.uri가 모두 있는 owner 객체를 재귀적으로 찾는 함수
 * @param obj 확인할 객체
 * @returns name과 displayPicture.uri가 모두 있는 owner 객체 또는 null
 */
const findOwnerWithNameAndDisplayPicture = (obj: any): any | null => {
  if (!obj || typeof obj !== "object") {
    return null;
  }

  // 현재 객체가 owner이고 name과 displayPicture.uri가 모두 있는지 확인
  if (
    obj.hasOwnProperty("name") &&
    obj.name &&
    obj.hasOwnProperty("displayPicture") &&
    obj.displayPicture &&
    obj.displayPicture.uri
  ) {
    return obj;
  }

  // 배열인 경우 각 요소를 재귀적으로 탐색
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findOwnerWithNameAndDisplayPicture(item);
      if (result) {
        return result;
      }
    }
  } else {
    // 객체인 경우 각 속성을 재귀적으로 탐색
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const result = findOwnerWithNameAndDisplayPicture(obj[key]);
        if (result) {
          return result;
        }
      }
    }
  }

  return null;
};

/**
 * 객체 내에 fb_reel_react_button과 feedback이 둘 다 있는 객체를 찾는 함수
 * @param obj 확인할 객체
 * @returns fb_reel_react_button과 feedback이 모두 있는 객체 배열
 */
const findObjectsWithReactButtonAndFeedback = (obj: any): any[] => {
  const results: any[] = [];

  if (!obj || typeof obj !== "object") {
    return results;
  }

  // 현재 객체에 fb_reel_react_button과 feedback이 둘 다 있는지 확인
  if (
    obj.hasOwnProperty("fb_reel_react_button") &&
    obj.fb_reel_react_button &&
    obj.hasOwnProperty("feedback") &&
    obj.feedback
  ) {
    results.push(obj);
  }

  // 배열인 경우 각 요소를 재귀적으로 탐색
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const nestedResults = findObjectsWithReactButtonAndFeedback(item);
      results.push(...nestedResults);
    }
  } else {
    // 객체인 경우 각 속성을 재귀적으로 탐색
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const nestedResults = findObjectsWithReactButtonAndFeedback(obj[key]);
        results.push(...nestedResults);
      }
    }
  }

  return results;
};

/**
 * 객체 내에 first_frame_thumbnail 필드가 있는 객체를 찾는 함수
 * @param obj 확인할 객체
 * @returns first_frame_thumbnail 필드가 있는 객체 배열
 */
const findObjectsWithFirstFrameThumbnail = (obj: any): any[] => {
  const results: any[] = [];

  if (!obj || typeof obj !== "object") {
    return results;
  }

  // 현재 객체에 first_frame_thumbnail 필드가 있는지 확인
  if (
    obj.hasOwnProperty("first_frame_thumbnail") &&
    obj.first_frame_thumbnail
  ) {
    results.push(obj);
  }

  // 배열인 경우 각 요소를 재귀적으로 탐색
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const nestedResults = findObjectsWithFirstFrameThumbnail(item);
      results.push(...nestedResults);
    }
  } else {
    // 객체인 경우 각 속성을 재귀적으로 탐색
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const nestedResults = findObjectsWithFirstFrameThumbnail(obj[key]);
        results.push(...nestedResults);
      }
    }
  }

  return results;
};

/**
 * HTML에서 data-sjs 속성이 있는 스크립트 태그의 JSON 데이터를 추출하는 함수
 * downloadable_uri_hd 또는 downloadable_uri_sd 필드가 있는 객체만 추출합니다.
 * @param html HTML 문자열
 * @returns {videoObjects: any[], ownerObjects: any[], feedbackObjects: any[], firstFrameThumbnailObjects: any[]} downloadable_uri가 있는 객체 배열, owner 객체 배열, feedback 객체 배열, first_frame_thumbnail 객체 배열
 */
const extractScriptJson = (
  html: string
): {
  videoObjects: any[];
  ownerObjects: any[];
  feedbackObjects: any[];
  firstFrameThumbnailObjects: any[];
} => {
  try {
    // data-sjs 속성이 있는 script 태그 찾기
    const scriptRegex =
      /<script[^>]*type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g;
    const allVideoObjects: any[] = [];
    const allOwnerObjects: any[] = [];
    const allFeedbackObjects: any[] = [];
    const allFirstFrameThumbnailObjects: any[] = [];
    let match;

    while ((match = scriptRegex.exec(html)) !== null) {
      const jsonContent = match[1].trim();

      try {
        const parsed = JSON.parse(jsonContent);

        // downloadable_uri_hd 또는 downloadable_uri_sd 필드가 있는 모든 객체 찾기
        const videoObjects = findObjectsWithDownloadableUris(parsed);
        allVideoObjects.push(...videoObjects);

        // name과 displayPicture.uri가 모두 있는 owner 객체 찾기
        const ownerObject = findOwnerWithNameAndDisplayPicture(parsed);
        if (ownerObject) {
          allOwnerObjects.push(ownerObject);
        }

        // fb_reel_react_button과 feedback이 둘 다 있는 객체 찾기
        const feedbackObjects = findObjectsWithReactButtonAndFeedback(parsed);
        allFeedbackObjects.push(...feedbackObjects);

        // first_frame_thumbnail 있는 객체 찾기
        const firstFrameThumbnailObjects =
          findObjectsWithFirstFrameThumbnail(parsed);
        allFirstFrameThumbnailObjects.push(...firstFrameThumbnailObjects);
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    }

    return {
      videoObjects: allVideoObjects,
      ownerObjects: allOwnerObjects,
      feedbackObjects: allFeedbackObjects,
      firstFrameThumbnailObjects: allFirstFrameThumbnailObjects,
    };
  } catch (error) {
    console.error("Error extracting script JSON:", error);
    return {
      videoObjects: [],
      ownerObjects: [],
      feedbackObjects: [],
      firstFrameThumbnailObjects: [],
    };
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
    const reelId = await extractReelId(url);

    if (!reelId) {
      return NextResponse.json(
        {
          error: "Invalid URL",
          message: "Could not extract facebook ID from URL",
        },
        { status: 400 }
      );
    }

    const html = await getFacebookDetailInfo(reelId);

    // HTML에서 downloadable_uri_hd 또는 downloadable_uri_sd 필드가 있는 스크립트 태그의 JSON 추출
    const {
      videoObjects: dataArray,
      ownerObjects,
      feedbackObjects,
      firstFrameThumbnailObjects,
    } = extractScriptJson(html);

    if (!dataArray || dataArray.length === 0) {
      return NextResponse.json(
        { error: "no data", message: "Could not extract facebook data" },
        { status: 200 }
      );
    }

    if (all) {
      return NextResponse.json(dataArray, { status: 200 });
    }

    // pk 값이 중복되는 경우 제거
    const uniqueData = dataArray.filter(
      (item: any, index: number, self: any[]) =>
        index === self.findIndex((t) => t.id === reelId)
    );

    // name과 displayPicture.uri가 모두 있는 owner 객체 찾기
    const validOwner = ownerObjects.length > 0 ? ownerObjects[0] : null;

    // fb_reel_react_button과 feedback이 둘 다 있는 객체 찾기
    const validFeedback = feedbackObjects.filter(
      (item: any) => Number(item.video.id) === Number(reelId)
    )[0];

    const results = uniqueData.map((item: any) => {
      // name과 displayPicture.uri가 모두 있는 owner 객체 우선 사용
      const owner = validOwner || item?.owner;
      const user = item?.user;

      // name 매핑
      const userName = owner?.name || user?.username || user?.full_name || "";

      // screenName 매핑 (owner.url에서 추출 또는 user 정보 사용)
      let userScreenName = "";
      if (owner?.url) {
        // URL에서 사용자명 추출 (예: https://www.facebook.com/SassyK68 -> SassyK68)
        const urlMatch = owner.url.match(/facebook\.com\/([^/?]+)/);
        userScreenName = urlMatch ? urlMatch[1] : owner.url;
      } else {
        userScreenName = user?.username || "";
      }

      // avatar 매핑 (displayPicture.uri 우선 사용)
      const avatar =
        owner?.displayPicture?.uri ||
        item?.displayPicture?.uri ||
        user?.displayPicture?.uri ||
        user?.hd_profile_pic_url_info?.url ||
        user?.profile_pic_url ||
        "";

      const content = item?.caption?.text || item?.text || "";

      // thumbnail 매핑 (displayPicture도 고려)
      const thumbnail =
        firstFrameThumbnailObjects[0]?.first_frame_thumbnail ||
        item?.image_versions2?.candidates?.[0]?.url ||
        item?.cover_photo?.uri ||
        owner?.displayPicture?.uri ||
        item?.displayPicture?.uri ||
        "";

      // downloadable_uri_hd와 downloadable_uri_sd를 videoItems로 변환
      const videoItems: any[] = [];

      if (item?.downloadable_uri_hd) {
        videoItems.push({
          url: item.downloadable_uri_hd,
          content_type: "video/mp4",
          bitrate: 0,
          quality: "720p",
        });
      }

      if (item?.downloadable_uri_sd) {
        videoItems.push({
          url: item.downloadable_uri_sd,
          content_type: "video/mp4",
          bitrate: 0,
          quality: "480p",
        });
      }

      // 통계 정보 매핑 (fb_reel_react_button과 feedback 우선 사용)
      const favoriteCount =
        validFeedback?.fb_reel_react_button?.story?.feedback?.likers?.count ||
        validFeedback?.fb_reel_react_button?.count ||
        validFeedback?.likers?.count ||
        item?.likers?.count ||
        item?.like_count ||
        item?.reaction_count ||
        0;

      const shareCount =
        validFeedback?.feedback?.share_count_reduced ||
        item?.feedback?.share_count_reduced ||
        item?.share_count_reduced ||
        item?.shares_count ||
        item?.share_count ||
        0;

      const replyCount =
        validFeedback?.feedback?.total_comment_count ||
        item?.feedback?.total_comment_count ||
        item?.total_comment_count ||
        item?.comment_count ||
        item?.comments_count ||
        0;
      const quoteCount = item?.quotes_count || 0;
      const viewCount = item?.view_count || item?.views || 0;
      const createdAt =
        item?.caption?.created_at || item?.creation_time
          ? new Date(
              (item.caption?.created_at || item.creation_time) * 1000
            ).toISOString()
          : new Date().toISOString();

      return {
        type: "facebook",
        id: item?.pk || item?.id || reelId,
        user: {
          name: userName,
          screenName: userScreenName,
          avatar,
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
    });

    return NextResponse.json(results.length === 1 ? results[0] : results, {
      status: 200,
    });
  } catch (e: any) {
    console.error("Error in GET /api/x:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 200 }
    );
  }
}
