import { NextRequest, NextResponse } from "next/server";

/**
 * Dailymotion URL에서 video ID를 추출하는 함수
 * @param url Dailymotion URL
 * @returns video ID 또는 null
 *
 * 지원하는 URL 형식:
 * - https://www.dailymotion.com/video/x9vo048
 * - https://dai.ly/xxxxx
 */
const extractVideoId = (url: string): string | null => {
  try {
    // dai.ly 단축 URL 처리
    if (url.includes("dai.ly/")) {
      const match = url.match(/dai\.ly\/([^/?]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    // /video/ 형식 처리
    const videoMatch = url.match(/\/video\/([^/?]+)/);
    if (videoMatch && videoMatch[1]) {
      return videoMatch[1];
    }

    // URL 파싱
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    // pathname이 /video/ID 형식인 경우
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

const getDailymotionDetailInfo = async (videoId: string) => {
  const embedder = `https%3A%2F%2Fwww.dailymotion.com%2Fvideo%2F${videoId}`;
  const url = `https://geo.dailymotion.com/video/${videoId}.json?legacy=true&embedder=${embedder}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9,ko;q=0.8",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "sec-ch-ua":
        '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Dailymotion page: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return data;
};

// https://cdndirector.dailymotion.com/cdn/manifest/video/x9vnle4.m3u8?sec=AqtpiJXMtJyGkbDxPPXc5KsiajHySMZ1CQCGy-PxksYT6tWRjkSlbMHi8ITzEHDTQn54dffKnKxGEKxN_JaSMQ&dmTs=&dmV1st=
const getDaliyMotionVideoUrl = async (videoId: string, videoUrl: string) => {
  const videoUrlParams = new URL(videoUrl);
  const sec = videoUrlParams.searchParams.get("sec");
  const dmTs = videoUrlParams.searchParams.get("dmTs");
  const dmV1st = videoUrlParams.searchParams.get("dmV1st");
  const url = `https://cdndirector.dailymotion.com/cdn/manifest/video/${videoId}.m3u8?sec=${sec}&dmTs=${dmTs}&dmV1st=${dmV1st}`;
  // https://cdndirector.dailymotion.com/cdn/manifest/video/x9vnle4.m3u8?sec=AqtpiJXMtJyGkbDxPPXc5KsiajHySMZ1CQCGy-PxksYT6tWRjkSlbMHi8ITzEHDTQn54dffKnKxGEKxN_JaSMQ&dmTs=&dmV1st=

  // try {
  //   const myHeaders = new Headers();
  //   myHeaders.append(
  //     "Cookie",
  //     "dmvk=693e14107e305; v1st=362D321BDBF6C6A226DA57B927453DE7"
  //   );

  //   const requestOptions = {
  //     method: "GET",
  //     headers: myHeaders,
  //     redirect: "follow",
  //   };

  //   const response = await fetch(
  //     "https://cdndirector.dailymotion.com/cdn/manifest/video/x9vnle4.m3u8?sec=AqtpiJXMtJyGkbDxPPXc5KsiajHySMZ1CQCGy-PxksYT6tWRjkSlbMHi8ITzEHDTQn54dffKnKxGEKxN_JaSMQ&dmTs=&dmV1st=",
  //     {
  //       method: "GET",
  //       headers: myHeaders,
  //       redirect: "follow",
  //     }
  //   );
  //   console.log("response: ", response);
  //   if (!response.ok) {
  //     throw new Error(
  //       `Failed to fetch video: ${response.status} ${response.statusText}`
  //     );
  //   }
  //   const data = await response.text();
  //   console.log("data: ", data);
  //   return data;
  // } catch (e: any) {
  //   console.error("Error in getDaliyMotionVideoUrl:", e.message);
  //   return null;
  // }

  try {
    const url = `https://cdndirector.dailymotion.com/cdn/manifest/video/${videoId}.m3u8?sec=${sec}&dmTs=${dmTs}&dmV1st=${dmV1st}`;
    console.log("Fetching M3U8 URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
        // Accept-Encoding 제거: Node.js fetch가 자동으로 처리하지만 br은 지원하지 않을 수 있음
        Referer: "https://www.dailymotion.com/",
        Origin: "https://www.dailymotion.com",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "Sec-Ch-Ua":
          '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"macOS"',
        Cookie: "dmvk=693e14107e305; v1st=362D321BDBF6C6A226DA57B927453DE7",
      },
      redirect: "follow",
    });

    console.log("Response status:", response.status, response.statusText);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response || !response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Could not read error response");
      console.error("Error response body:", errorText);
      throw new Error(
        `Failed to fetch video: ${response.status} ${
          response.statusText
        }. Body: ${errorText.substring(0, 200)}`
      );
    }

    const data = await response.text();
    console.log("M3U8 data length:", data.length);
    return data;
  } catch (error: any) {
    console.error("Error in getDaliyMotionVideoUrl:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
    });
    throw error;
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url") || "";

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid Dailymotion URL" },
        { status: 400 }
      );
    }

    const videoData = await getDailymotionDetailInfo(videoId);

    const result = {
      id: videoId,
      user: {
        name: videoData?.owner?.screenname || "",
        screenName: videoData?.owner?.username || "",
        avatar: videoData?.owner?.avatars?.[60] || "",
      },
      content: videoData.title || videoData.description || "",
      thumbnail:
        videoData?.thumbnails?.[480] ||
        videoData?.thumbnails?.[720] ||
        videoData?.thumbnails?.[360] ||
        "",
      videoItems:
        videoData?.qualities?.auto?.map((item: any) => {
          return {
            url: videoData.qualities.auto[0].url,
            content_type: "video/mp4",
            bitrate: 0,
            quality: "1080p",
          };
        }) || [],
      stats: {
        favoriteCount: 0,
        shareCount: 0,
        replyCount: 0,
        quoteCount: 0,
        viewCount: 0,
      },
      createdAt: videoData.created_time
        ? new Date(videoData.created_time * 1000).toISOString()
        : new Date().toISOString(),
    };

    console.log("result: ", result);

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/dailymotion:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
