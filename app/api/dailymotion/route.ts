import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

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
      `Failed to fetch Dailymotion page: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  return data;
};

/**
 * M3U8 master playlist를 파싱하여 videoItems 배열로 변환
 */
const parseM3U8MasterPlaylist = (
  m3u8Text: string,
  baseUrl: string,
): Array<{
  url: string;
  content_type: string;
  bitrate: number;
  quality: string;
}> => {
  const videoItems: Array<{
    url: string;
    content_type: string;
    bitrate: number;
    quality: string;
  }> = [];

  const lines = m3u8Text.split("\n");
  let currentStreamInfo: {
    bandwidth: number;
    resolution: string;
    name: string | null;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // EXT-X-STREAM-INF 태그 파싱
    if (line.startsWith("#EXT-X-STREAM-INF:")) {
      const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
      const resolutionMatch = line.match(/RESOLUTION=(\d+)x(\d+)/);
      const nameMatch = line.match(/NAME="([^"]+)"/);

      // NAME이 있으면 NAME을 우선 사용, 없으면 RESOLUTION의 높이 사용
      let quality = "unknown";
      if (nameMatch) {
        quality = nameMatch[1] + "p";
      } else if (resolutionMatch) {
        quality = `${resolutionMatch[2]}p`;
      }

      currentStreamInfo = {
        bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1], 10) : 0,
        resolution: quality,
        name: nameMatch ? nameMatch[1] : null,
      };
    }
    // URL 라인 (EXT-X-STREAM-INF 다음에 오는 라인)
    else if (line && !line.startsWith("#") && currentStreamInfo) {
      // #cell=cf3 같은 해시 제거
      const cleanUrl = line.split("#")[0].trim();
      const streamUrl = cleanUrl.startsWith("http")
        ? cleanUrl
        : baseUrl + cleanUrl;

      videoItems.push({
        url: streamUrl,
        content_type: "application/x-mpegURL", // m3u8은 HLS 플레이리스트
        bitrate: currentStreamInfo.bandwidth,
        quality: currentStreamInfo.resolution,
      });

      currentStreamInfo = null; // 리셋
    }
  }

  // bitrate 기준으로 내림차순 정렬 (높은 품질이 먼저)
  videoItems.sort((a, b) => b.bitrate - a.bitrate);

  return videoItems;
};

// https://cdndirector.dailymotion.com/cdn/manifest/video/x9vnle4.m3u8?sec=AqtpiJXMtJyGkbDxPPXc5KsiajHySMZ1CQCGy-PxksYT6tWRjkSlbMHi8ITzEHDTQn54dffKnKxGEKxN_JaSMQ&dmTs=&dmV1st=
const getDaliyMotionVideoUrl = async (
  videoId: string,
  videoUrl: string,
): Promise<
  Array<{
    url: string;
    content_type: string;
    bitrate: number;
    quality: string;
  }>
> => {
  try {
    const videoUrlParams = new URL(videoUrl);
    const sec = videoUrlParams.searchParams.get("sec") || "";
    const dmTs = videoUrlParams.searchParams.get("dmTs") || "";
    const dmV1st = videoUrlParams.searchParams.get("dmV1st") || "";
    const url = `https://cdndirector.dailymotion.com/cdn/manifest/video/${videoId}.m3u8?sec=${sec}&dmTs=${dmTs}&dmV1st=${dmV1st}`;

    const headers = {
      "User-Agent": "*/*", // 이게 꼭 필요함
      "cache-control": "no-cache", // 이게 꼭 필요함
      expires: "0", // 이게 꼭 필요함
    };

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch m3u8: ${response.status}`);
    }
    const m3u8Text = await response.text();
    const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

    // M3U8 master playlist 파싱
    const videoItems = parseM3U8MasterPlaylist(m3u8Text, baseUrl);

    if (videoItems.length === 0) {
      throw new Error("No video streams found in m3u8 playlist");
    }

    return videoItems;
  } catch (error: any) {
    console.error("Error details:", {
      message: error?.message,
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
        { status: 400 },
      );
    }

    const videoData = await getDailymotionDetailInfo(videoId);

    const videoItems = await getDaliyMotionVideoUrl(
      videoId,
      videoData.qualities.auto[0].url,
    );

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
      videoItems,
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

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/dailymotion:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
