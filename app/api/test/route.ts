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
        url: "https://x.com/Harman_Kardon_/status/1956945691537727695",
      },
      {
        type: "tiktok",
        url: "https://www.tiktok.com/@l__wonwoo/video/7550638875824098567",
      },
      {
        type: "instagram",
        url: "https://www.instagram.com/reel/DQmGlkBkQm_",
      },
      {
        type: "facebook",
        url: "https://www.facebook.com/share/v/17rMQCDSfL/",
      },
    ];

    const result = await Promise.all(
      testUrl.map(async (item) => {
        const response = await fetch(
          `http://localhost:3000/api/${item.type}?url=${item.url}`
        );
        return response.json();
      })
    );

    const results = result.map((item) => {
      const obj = Array.isArray(item) ? item[0] : item;
      return {
        success: obj.videoItems[0].url ? true : false,
        type: obj.type,
        url: obj.videoItems[0].url,
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
