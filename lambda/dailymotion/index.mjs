import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

/**
 * Constants & Headers
 */
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
  Origin: "https://www.dailymotion.com",
  Referer: "https://www.dailymotion.com/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  "Sec-Ch-Ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
};

/**
 * Helper: Master playlist에서 가장 높은 품질의 스트림 URL을 선택
 */
async function getBestStreamUrl(masterPlaylistUrl) {
  console.log("Fetching master playlist:", masterPlaylistUrl);

  const response = await fetch(masterPlaylistUrl, { headers: DEFAULT_HEADERS, redirect: "follow" });
  if (!response.ok) throw new Error(`Failed to fetch master playlist: ${response.status}`);

  const m3u8Text = await response.text();
  const baseUrl = masterPlaylistUrl.substring(0, masterPlaylistUrl.lastIndexOf("/") + 1);

  if (m3u8Text.includes("#EXT-X-STREAM-INF")) {
    const lines = m3u8Text.split("\n");
    let bestBandwidth = 0;
    let bestStreamUrl = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#EXT-X-STREAM-INF")) {
        const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
        const bandwidth = bandwidthMatch ? parseInt(bandwidthMatch[1], 10) : 0;

        if (i + 1 < lines.length) {
          const urlLine = lines[i + 1].trim();
          if (urlLine && !urlLine.startsWith("#")) {
            const cleanUrl = urlLine.split("#")[0];
            if (bandwidth > bestBandwidth) {
              bestBandwidth = bandwidth;
              bestStreamUrl = cleanUrl.startsWith("http") ? cleanUrl : baseUrl + cleanUrl;
            }
          }
        }
      }
    }

    if (bestStreamUrl) return bestStreamUrl;
  }
  return masterPlaylistUrl;
}

/**
 * Helper: M3U8 플레이리스트에서 세그먼트 URL 추출
 */
async function getSegmentsFromM3U8(m3u8Url) {
  console.log("Fetching m3u8 playlist:", m3u8Url);
  const response = await fetch(m3u8Url, { headers: DEFAULT_HEADERS, redirect: "follow" });
  if (!response.ok) throw new Error(`Failed to fetch m3u8: ${response.status}`);

  const m3u8Text = await response.text();
  const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);

  let initUrl = null;
  const segmentUrls = [];

  const mapMatch = m3u8Text.match(/#EXT-X-MAP:URI="([^"]+)"/);
  if (mapMatch && mapMatch[1]) {
    const uri = mapMatch[1];
    initUrl = uri.startsWith("http") ? uri : baseUrl + uri;
  }

  const lines = m3u8Text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.length > 0) {
      const cleanUrl = trimmed.split("#")[0];
      const segUrl = cleanUrl.startsWith("http") ? cleanUrl : baseUrl + cleanUrl;
      segmentUrls.push(segUrl);
    }
  }

  return { initUrl, segmentUrls };
}

/**
 * Dailymotion Lambda Handler
 */
export const handler = awslambda.streamifyResponse(async (event, responseStream, _context) => {
  const query = event.queryStringParameters || {};
  const videoUrl = query.videoUrl;
  const filename = query.filename || new Date().toISOString();

  if (!videoUrl) {
    const errorBody = JSON.stringify({ error: "videoUrl required" });
    responseStream.setContentType("application/json");
    responseStream.write(errorBody);
    responseStream.end();
    return;
  }

  try {
    // 1. M3U8 (HLS) 처리
    if (videoUrl.includes(".m3u8")) {
        const streamUrl = await getBestStreamUrl(videoUrl);
        const { initUrl, segmentUrls } = await getSegmentsFromM3U8(streamUrl);

        if (segmentUrls.length === 0) {
            throw new Error("No segments found");
        }

        // Set Headers for Streaming Download
        const metadata = {
            statusCode: 200,
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": `attachment; filename="ssdown-dailymotion-${filename}.mp4"`,
                "Cache-Control": "no-cache"
            }
        };
        responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

        // Download Init Segment
        if (initUrl) {
            try {
                const initRes = await fetch(initUrl, { headers: DEFAULT_HEADERS });
                if (initRes.ok) {
                   const arrayBuffer = await initRes.arrayBuffer();
                   responseStream.write(Buffer.from(arrayBuffer));
                }
            } catch (e) {
                console.error("Init segment error:", e);
            }
        }

        // Download Segments Sequentially
        for (let i = 0; i < segmentUrls.length; i++) {
            try {
                const segRes = await fetch(segmentUrls[i], { headers: DEFAULT_HEADERS });
                if (!segRes.ok) continue;
                
                // Using arrayBuffer and writing to stream
                const arrayBuffer = await segRes.arrayBuffer();
                responseStream.write(Buffer.from(arrayBuffer));

            } catch (e) {
                console.error(`Segment ${i} error:`, e);
            }
        }
        
        responseStream.end();

    } else {
        // 2. Direct Video (MP4) 처리
        const response = await fetch(videoUrl, { headers: DEFAULT_HEADERS, redirect: "follow" });
        if (!response.ok) throw new Error(`Failed to fetch video: ${response.status}`);

         const metadata = {
            statusCode: 200,
            headers: {
                "Content-Type": response.headers.get("content-type") || "video/mp4",
                "Content-Disposition": `attachment; filename="ssdown-dailymotion-${filename}.mp4"`,
                "Cache-Control": "public, max-age=3600"
            }
        };
        responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

        // Stream Pipeline
        if (response.body) {
            const nodeStream = Readable.fromWeb(response.body);
            await pipeline(nodeStream, responseStream);
        } else {
            responseStream.end();
        }
    }

  } catch (error) {
    console.error("Download Error:", error);
    if (!responseStream.headersSent) {
        responseStream = awslambda.HttpResponseStream.from(responseStream, { statusCode: 500 });
    }
    responseStream.write(JSON.stringify({ error: "Download failed", message: error.message }));
    responseStream.end();
  }
});
