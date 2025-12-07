import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("videoUrl");
    const filename = searchParams.get("filename") ?? new Date().toISOString();

    if (!videoUrl) {
      return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
    }

    // URL 디코딩
    const decodedVideoUrl = decodeURIComponent(videoUrl);

    // videoUrl 파라미터 분리
    let videoUrlParams: URL;
    try {
      videoUrlParams = new URL(decodedVideoUrl);
    } catch (error: any) {
      console.error("Error in GET /api/tiktok/download:", error);
      return NextResponse.json(
        { error: "Invalid videoUrl format" },
        { status: 400 }
      );
    }

    const baseUrl = `${videoUrlParams.origin}${videoUrlParams.pathname}`;
    const expire = videoUrlParams.searchParams.get("expire");
    const l = videoUrlParams.searchParams.get("l");
    const policy = videoUrlParams.searchParams.get("policy");
    const signature = videoUrlParams.searchParams.get("signature");
    const tk = videoUrlParams.searchParams.get("tk");
    const tt_chain_token =
      videoUrlParams.searchParams.get("tt_chain_token")?.replaceAll(" ", "+") ||
      "";

    // 필수 파라미터 검증
    if (!expire || !l || !policy || !signature || !tk || !tt_chain_token) {
      return NextResponse.json(
        { error: "Missing required URL parameters" },
        { status: 400 }
      );
    }

    // URL 조합
    const TIKTOK_VIDEO_URL = `${baseUrl}?expire=${expire}&l=${l}&policy=${policy}&signature=${signature}&tk=${tk}`;

    // 쿠키 문자열 조합
    const TIKTOK_COOKIE = `tt_chain_token=${tt_chain_token};`;

    console.log("TIKTOK_COOKIE: ", TIKTOK_COOKIE);
    console.log("TIKTOK_VIDEO_URL: ", TIKTOK_VIDEO_URL);

    const response = await fetch(TIKTOK_VIDEO_URL, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        cookie: TIKTOK_COOKIE,
        origin: "https://www.tiktok.com",
        pragma: "no-cache",
        priority: "u=1, i",
        referer: "https://www.tiktok.com/",
        "sec-ch-ua":
          '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch video: ${response.status} ${response.statusText}`
      );
    }

    // 비디오 파일이므로 바이너리 데이터로 처리
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Content-Type 헤더 가져오기
    const contentType = response.headers.get("content-type") || "video/mp4";

    // 바이너리 데이터를 Response로 반환
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `attachment; filename="ssdown-${filename}.mp4"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: any) {
    console.error("Error in GET /api/tiktok/download:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
