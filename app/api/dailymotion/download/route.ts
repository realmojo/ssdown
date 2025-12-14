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

    const response = await fetch(decodedVideoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
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
        "Content-Disposition": `attachment; filename="ssdown-dailymotion-${filename}.mp4"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: any) {
    console.error("Error in GET /api/dailymotion/download:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
