import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

/**
 * Instagram URL에서 reel ID를 추출하는 함수
 * @param url Instagram reel URL
 * @returns reel ID 또는 null
 *
 * 지원하는 URL 형식:
 * - https://9gag.com/gag/aNDGXAw
 * - https://9gag.com/gag/aNDGXAw?dfdfdf
 */
const extractGagId = (url: string): string | null => {
  try {
    // 정규식으로 /reel/ 다음의 ID 추출
    const gagMatch = url.match(/\/gag\/([^/?]+)/);
    if (gagMatch && gagMatch[1]) {
      return gagMatch[1];
    }

    // 정규식이 실패한 경우 대체 방법: URL 파싱
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    // pathname이 /reel/ID 형식인 경우
    const gagIndex = pathParts.indexOf("gag");
    if (gagIndex !== -1 && gagIndex + 1 < pathParts.length) {
      return pathParts[gagIndex + 1];
    }

    return null;
  } catch (error) {
    console.error("Error extracting gag ID:", error);
    return null;
  }
};

const get9gagDetailInfo = async (gagId: string) => {
  try {
    const url = `https://9gag.com/gag/${gagId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "ko-KR,ko;q=0.9",
        "cache-control": "no-cache",
        // cookie:
        //   "____ri=1026; ____lo=KR; sign_up_referer=; consentUUID=9b3b9e8e-80c2-4fd2-a765-09a5aa636fd5; usnatUUID=c6645a8c-606c-4565-b0aa-4a2719f61e97; _pk_ses.7.f7ab=*; _fbp=fb.1.1765373791668.97248087790285115; _lr_retry_request=true; _lr_env_src_ats=false; _cc_id=6bfd6651fd761a5e6bef68762ad7fe5e; panoramaId_expiry=1765978592053; panoramaId=5bca08e1098600bb5772ea8cd693185ca02cfda75cc4d12cc304a344842900cb; panoramaIdType=panoDevice; _lr_geo_location=KR; _pubcid=d362948b-cb63-459e-9509-e723e00c8bc2; _pubcid_cst=zix7LPQsHA%3D%3D; pbjs-unifiedid=%7B%22TDID%22%3A%2274371b5e-6371-4ee3-9278-cd42307fb531%22%2C%22TDID_LOOKUP%22%3A%22FALSE%22%2C%22TDID_CREATED_AT%22%3A%222025-12-10T13%3A36%3A32%22%7D; pbjs-unifiedid_cst=zix7LPQsHA%3D%3D; _lr_sampling_rate=100; cto_bundle=W3DmvV9ob0ptMTFCRFR5VldJSllVck9ZMHFwaEFLZkpPRkdMN2lxbU9XMXNva3dlVnJKMDA0anhlczZKTnl4bld1SkpWZzlqcUEwS1BxaDdzWmZLQnlsYlAxaHZqSWRXV1clMkZNT1R3ZThTbjFUMUJraVdtSDRyZWZKMVlSMUViYWZ3VGgyZTdNemxzVFRMJTJCd2hPZUl0VnluckklMkZmV01oaiUyQmE2emZIYXNJTkU5OWV6QSUzRA; cto_bidid=cBEKO191dkViOVJpU3BlN2dQaEVsJTJGZCUyQlRLN2ttMXllTWQzem1QUGw1SGJ1SyUyRmpXVGhLNFBRSFVkWmVBQzdLSWxQZUN0Zk1yRUQlMkJZZm1YeUgxM2VFRFQ2VUlYV1cxNW9VNmszSDNxc3F2NmRCSnJvJTNE; __gads=ID=78c02e03c6b52650:T=1765373793:RT=1765374107:S=ALNI_MYk1JK59TZ_yr0Wx5q1vD_Bd3aXNw; __gpi=UID=000011c730ff2ba4:T=1765373793:RT=1765374107:S=ALNI_MboIHLewv_ODYEWLV_LsLnMfrMGnw; __eoi=ID=f26b7b5420e7d50e:T=1765373793:RT=1765374107:S=AA-AfjYaKVqTpcQQqGzSL2fEDpN1; _pk_id.7.f7ab=b06e0c58d89c741d.1765373791.1.1765374254.1765373791.; PHPSESSID=jpf60iupef7ag2qh9bg5fkat91; cacheableClear=1; ts1=278ecb1e7238e5a26e4f941c5ba468b236ab4543; _ga_YY84CFQCF5=GS2.1.s1765373790$o1$g1$t1765374264$j49$l0$h0",
        // pragma: "no-cache",
        // priority: "u=0, i",
        referer: url,
        origin: "https://9gag.com",
        "sec-ch-ua":
          '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        // "sec-ch-ua-mobile": "?0",
        // "sec-ch-ua-platform": '"macOS"',
        // "sec-fetch-dest": "document",
        // "sec-fetch-mode": "navigate",
        // "sec-fetch-site": "same-origin",
        // "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
      },
    });

    console.log(response);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch 9gag page: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    fs.writeFileSync("9gag.html", html);

    // HTML이 제대로 파싱되는지 확인 (바이너리가 아닌 텍스트인지)
    return html;
  } catch (error) {
    console.error("Error fetching 9gag detail info:", error);
    return null;
  }
};

/**
 * HTML에서 data-sjs 속성이 있는 스크립트 태그의 JSON 데이터를 추출하는 함수
 * video_versions 필드가 있는 객체만 추출합니다.
 * carousel_media 안에 여러 개의 video_versions가 있는 경우도 처리합니다.
 * @param html HTML 문자열
 * @returns video_versions 필드가 있는 파싱된 JSON 객체 (carousel_media가 있으면 첫 번째 항목 또는 메인 객체)
 */
const extractScriptJson = (html: string): any => {
  try {
    // data-sjs 속성이 있는 script 태그 찾기
    const scriptRegex =
      /<script[^>]*type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g;
    const allVideoObjects: any[] = [];
    let match;

    return allVideoObjects;
  } catch (error) {
    console.error("Error extracting script JSON:", error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const all = searchParams.get("all") === "true";

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    // URL에서 reel ID 추출
    const gagId = extractGagId(url);

    if (!gagId) {
      return NextResponse.json(
        { error: "Invalid URL", message: "Could not extract gag ID from URL" },
        { status: 400 }
      );
    }

    const html = await get9gagDetailInfo(gagId);

    if (!html) {
      return NextResponse.json(
        { error: "no data", message: "Could not fetch 9gag detail info" },
        { status: 200 }
      );
    }

    // HTML에서 video_versions 필드가 있는 스크립트 태그의 JSON 추출
    const data = extractScriptJson(html);

    if (!data) {
      return NextResponse.json(
        { error: "no data", message: "Could not extract 9gag data" },
        { status: 200 }
      );
    }

    if (all) {
      return NextResponse.json(data, { status: 200 });
    }

    const results = data.map((item: any) => {
      return {
        type: "9gag",
        id: gagId,
        user: {
          name: item?.user?.full_name || "",
          screenName: item?.user?.username || "",
          avatar: item?.user?.profile_pic_url || "",
        },
        content: item?.caption?.text || "",
        thumbnail: item?.image_versions2?.candidates[0]?.url || "",
        videoItems: item?.video_versions?.map((video: any, index: number) => {
          return {
            url: video?.url || "",
            content_type: video?.content_type || "",
            bitrate: video?.bitrate || "",
            quality: index === 0 ? "720p" : index === 1 ? "480p" : "360p",
          };
        }),
        stats: {
          favoriteCount: item?.like_count || 0,
          shareCount: item?.shares_count || 0,
          replyCount: item?.comment_count || 0,
          quoteCount: item?.quotes_count || 0,
          viewCount: item?.view_count || 0,
        },
        createdAt: item?.caption?.created_at
          ? new Date(item?.caption?.created_at * 1000).toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json(results, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/x:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 200 }
    );
  }
}
