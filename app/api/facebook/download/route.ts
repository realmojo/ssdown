import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("videoUrl");
    const filename = searchParams.get("filename") ?? new Date().toISOString();

    if (!videoUrl) {
      return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
    }

    const response = await fetch(videoUrl);

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
    console.error("Error in GET /api/x/download:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
