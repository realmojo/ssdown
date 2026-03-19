import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const KUAISHOU_UA =
  "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36";

function extractPhotoId(url: string): string | null {
  try {
    // https://www.kuaishou.com/video/3xmn8ximrdkfkfq
    // https://www.gifshow.com/video/3xmn8ximrdkfkfq
    const match = url.match(/\/video\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    // https://v.kuaishou.com/XXXXX short link — return as-is for redirect handling
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\//, "");
    if (path) return path;
  } catch {}
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    // Resolve short links (v.kuaishou.com)
    let resolvedUrl = url;
    if (url.includes("v.kuaishou.com")) {
      const r = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": KUAISHOU_UA },
      });
      resolvedUrl = r.url;
    }

    const photoId = extractPhotoId(resolvedUrl);
    if (!photoId) {
      return NextResponse.json(
        { error: "Could not extract photo ID from URL" },
        { status: 400 },
      );
    }

    // Kuaishou GraphQL API (same as web client)
    const gqlUrl = "https://www.kuaishou.com/graphql";
    const body = JSON.stringify({
      operationName: "visionVideoDetail",
      variables: { photoId, page: "detail" },
      query: `query visionVideoDetail($photoId: String, $page: String) {
  visionVideoDetail(photoId: $photoId, page: $page) {
    photo {
      id
      photoId
      desc
      likeCount
      viewCount
      commentCount
      shareCount
      timestamp
      mainMvUrl
      videoUrl
      coverUrl
      photoUrl
      user {
        id
        name
        avatar
      }
    }
    currentWork {
      photoId
      desc
      likeCount
      viewCount
      commentCount
      shareCount
      timestamp
      mainMvUrl
      videoUrl
      coverUrl
      photoUrl
      user {
        id
        name
        avatar
      }
    }
  }
}`,
    });

    const response = await fetch(gqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": KUAISHOU_UA,
        Referer: `https://www.kuaishou.com/video/${photoId}`,
        Origin: "https://www.kuaishou.com",
      },
      body,
    });

    const data = await response.json();
    const detail = data?.data?.visionVideoDetail;
    const photo = detail?.currentWork ?? detail?.photo;

    if (!photo) {
      return NextResponse.json(
        { error: "Video not found", message: "No photo in response" },
        { status: 404 },
      );
    }

    const videoUrl = photo.mainMvUrl ?? photo.videoUrl ?? null;
    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL not found" },
        { status: 404 },
      );
    }

    const result = {
      type: "kuaishou",
      id: photo.photoId ?? photo.id ?? photoId,
      user: {
        name: photo.user?.name ?? "",
        screenName: photo.user?.id ?? "",
        avatar: photo.user?.avatar ?? "",
      },
      content: photo.desc ?? "",
      thumbnail: photo.coverUrl ?? photo.photoUrl ?? "",
      videoItems: [
        {
          url: videoUrl,
          content_type: "video/mp4",
          quality: "HD",
          bitrate: 0,
        },
      ],
      stats: {
        favoriteCount: photo.likeCount ?? 0,
        shareCount: photo.shareCount ?? 0,
        replyCount: photo.commentCount ?? 0,
        quoteCount: 0,
        viewCount: photo.viewCount ?? 0,
      },
      createdAt: photo.timestamp
        ? new Date(photo.timestamp).toISOString()
        : new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/kuaishou:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
