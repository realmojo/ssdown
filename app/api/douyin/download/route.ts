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
        `Failed to fetch video: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "video/mp4";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `attachment; filename="ssdown-douyin-${filename}.mp4"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: any) {
    console.error("Error in GET /api/douyin/download:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
