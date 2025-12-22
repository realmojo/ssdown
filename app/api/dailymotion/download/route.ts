import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
  Origin: "https://www.dailymotion.com",
  Referer: "https://www.dailymotion.com/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  "Sec-Ch-Ua":
    '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
};

/**
 * Master playlist에서 가장 높은 품질의 스트림 URL을 선택
 */
async function getBestStreamUrl(masterPlaylistUrl: string): Promise<string> {
  console.log("Fetching master playlist:", masterPlaylistUrl);

  const response = await fetch(masterPlaylistUrl, {
    headers: DEFAULT_HEADERS,
    redirect: "follow",
  });

  if (!response.ok) {
    console.error(
      `Failed to fetch master playlist: ${response.status} ${response.statusText}`
    );
    throw new Error(`Failed to fetch master playlist: ${response.status}`);
  }

  const m3u8Text = await response.text();
  const baseUrl = masterPlaylistUrl.substring(
    0,
    masterPlaylistUrl.lastIndexOf("/") + 1
  );

  // Master playlist 확인 (#EXT-X-STREAM-INF 태그가 있으면 master playlist)
  if (m3u8Text.includes("#EXT-X-STREAM-INF")) {
    const lines = m3u8Text.split("\n");
    let bestBandwidth = 0;
    let bestStreamUrl = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#EXT-X-STREAM-INF")) {
        // BANDWIDTH 추출
        const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
        const bandwidth = bandwidthMatch ? parseInt(bandwidthMatch[1], 10) : 0;

        // 다음 라인이 URL일 것
        if (i + 1 < lines.length) {
          const urlLine = lines[i + 1].trim();
          if (urlLine && !urlLine.startsWith("#")) {
            // #cell=core 같은 해시 제거
            const cleanUrl = urlLine.split("#")[0];
            if (bandwidth > bestBandwidth) {
              bestBandwidth = bandwidth;
              bestStreamUrl = cleanUrl.startsWith("http")
                ? cleanUrl
                : baseUrl + cleanUrl;
            }
          }
        }
      }
    }

    if (bestStreamUrl) {
      console.log(
        `Selected best stream: ${bestStreamUrl} (bandwidth: ${bestBandwidth})`
      );
      return bestStreamUrl;
    }
  }

  // Master playlist가 아니거나 스트림을 찾지 못한 경우, 원본 URL 반환
  console.log("Not a master playlist or no stream found, using original URL");
  return masterPlaylistUrl;
}

/**
 * M3U8 플레이리스트에서 세그먼트 URL들을 추출
 */
async function getSegmentsFromM3U8(m3u8Url: string): Promise<{
  initUrl: string | null;
  segmentUrls: string[];
}> {
  console.log("Fetching m3u8 playlist:", m3u8Url);

  const response = await fetch(m3u8Url, {
    headers: DEFAULT_HEADERS,
    redirect: "follow",
  });

  if (!response.ok) {
    console.error(
      `Failed to fetch m3u8: ${response.status} ${response.statusText}`
    );
    throw new Error(`Failed to fetch m3u8: ${response.status}`);
  }

  const m3u8Text = await response.text();
  const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);

  let initUrl: string | null = null;
  const segmentUrls: string[] = [];

  // Init segment 추출
  const mapMatch = m3u8Text.match(/#EXT-X-MAP:URI="([^"]+)"/);
  if (mapMatch && mapMatch[1]) {
    const uri = mapMatch[1];
    initUrl = uri.startsWith("http") ? uri : baseUrl + uri;
    console.log("Found init segment:", initUrl);
  }

  // 세그먼트 URL 추출
  const lines = m3u8Text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.length > 0) {
      // 해시 제거
      const cleanUrl = trimmed.split("#")[0];
      const segUrl = cleanUrl.startsWith("http")
        ? cleanUrl
        : baseUrl + cleanUrl;
      segmentUrls.push(segUrl);
    }
  }

  console.log(`Found ${segmentUrls.length} segments`);
  return { initUrl, segmentUrls };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("videoUrl");
    const filename = searchParams.get("filename") ?? new Date().toISOString();

    if (!videoUrl) {
      return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
    }

    console.log("Downloading video from URL:", videoUrl);

    // M3U8 URL인지 확인
    if (videoUrl.includes(".m3u8")) {
      // Master playlist인 경우 최고 품질 스트림 선택
      const streamUrl = await getBestStreamUrl(videoUrl);

      // 세그먼트 목록 가져오기
      const { initUrl, segmentUrls } = await getSegmentsFromM3U8(streamUrl);

      if (segmentUrls.length === 0) {
        throw new Error("No segments found in m3u8 playlist");
      }

      // ReadableStream으로 세그먼트들을 순차적으로 다운로드하고 병합
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const fetchSegment = async (url: string) => {
              const response = await fetch(url, {
                headers: DEFAULT_HEADERS,
                redirect: "follow",
              });

              if (!response.ok) {
                throw new Error(
                  `Failed to fetch segment: ${response.status} ${response.statusText}`
                );
              }

              return await response.arrayBuffer();
            };

            // 1. Init segment 다운로드
            if (initUrl) {
              try {
                console.log("Downloading init segment...");
                const initData = await fetchSegment(initUrl);
                controller.enqueue(new Uint8Array(initData));
                console.log("Init segment downloaded");
              } catch (e: any) {
                console.error("Failed to fetch init segment:", e.message);
                // Init 실패해도 계속 진행
              }
            }

            // 2. 모든 세그먼트 다운로드
            for (let i = 0; i < segmentUrls.length; i++) {
              try {
                const segmentData = await fetchSegment(segmentUrls[i]);
                controller.enqueue(new Uint8Array(segmentData));

                if ((i + 1) % 10 === 0 || i === segmentUrls.length - 1) {
                  console.log(
                    `Downloaded ${i + 1}/${segmentUrls.length} segments`
                  );
                }
              } catch (e: any) {
                console.error(
                  `Error fetching segment ${i + 1}/${segmentUrls.length}:`,
                  e.message
                );
                // 개별 세그먼트 실패는 무시하고 계속 진행
                continue;
              }
            }

            controller.close();
          } catch (e: any) {
            console.error("Error in stream:", e);
            controller.error(e);
          }
        },
      });

      return new NextResponse(stream, {
        status: 200,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="ssdown-dailymotion-${filename}.mp4"`,
          "Cache-Control": "no-cache",
        },
      });
    } else {
      // 일반 비디오 URL인 경우 (MP4 등)
      const response = await fetch(videoUrl, {
        headers: DEFAULT_HEADERS,
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch video: ${response.status} ${response.statusText}`
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
          "Content-Disposition": `attachment; filename="ssdown-dailymotion-${filename}.mp4"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch (e: any) {
    console.error("Error in GET /api/dailymotion/download:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
