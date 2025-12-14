// x
// https://x.com/Harman_Kardon_/status/1956945691537727695

// tiktok
// http://tiktok.com/@l__wonwoo/video/7550638875824098567

// instagram
// https://www.instagram.com/reel/DQmGlkBkQm_

// facebook
// https://www.facebook.com/share/v/17rMQCDSfL/

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const testUrl = [
      {
        type: "x",
        url: "https://x.com/danbeebb/status/1998003112683176125",
      },
      {
        type: "tiktok",
        url: "https://www.tiktok.com/@qwfewdev22/video/7572540247452503326",
      },
      {
        type: "instagram",
        url: "https://www.instagram.com/reel/DQmGlkBkQm_",
      },
      {
        type: "facebook",
        url: "https://www.facebook.com/share/v/17rMQCDSfL/",
      },
      {
        type: "9gag",
        url: "https://9gag.com/gag/aAyL9qd",
      },
      {
        type: "dailymotion",
        url: "https://www.dailymotion.com/video/x9vnuku",
      },
    ];

    const result = await Promise.all(
      testUrl.map(async (item) => {
        console.log("type: ", item.type);
        console.log("url: ", item.url);

        const response = await fetch(
          `http://localhost:3000/api/${item.type}?url=${encodeURIComponent(
            item.url
          )}`
        );

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const bodyText = await response.text();
          console.error(
            `[test] Non-JSON response for ${item.type}: status=${
              response.status
            }, preview=${bodyText.slice(0, 200)}`
          );
          return { success: false, type: item.type, error: "non-json" };
        }

        const data = await response.json();
        return { success: true, type: item.type, data };
      })
    );

    const results = result.map((item) => {
      if (!item.success) {
        return {
          success: false,
          type: item.type,
          url: null,
          error: item.error || "unknown",
        };
      }

      const obj = Array.isArray(item.data) ? item.data[0] : item.data;
      const firstVideo =
        obj?.videoItems && obj.videoItems.length > 0
          ? obj.videoItems[0].url
          : null;

      return {
        success: !!firstVideo,
        type: obj?.type || item.type,
        url: firstVideo,
      };
    });

    return NextResponse.json(results, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/test:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 200 }
    );
  }
}
