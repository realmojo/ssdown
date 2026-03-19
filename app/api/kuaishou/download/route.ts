import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("videoUrl");
    const filename = searchParams.get("filename") ?? new Date().toISOString();

    if (!videoUrl) {
      return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
    }

    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
        Referer: "https://www.kuaishou.com/",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch video: ${response.status} ${response.statusText}`,
      );
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="ssdown-kuaishou-${filename}.mp4"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: any) {
    console.error("Error in GET /api/kuaishou/download:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
