import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

/**
 * TikTok Video Downloader - AWS Lambda Function URL Handler
 * Node.js 18.x or 20.x Runtime required
 * "Invoke Mode: RESPONSE_STREAM" required
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
     // URL parsing and reconstruction logic from original route.ts
    const decodedVideoUrl = decodeURIComponent(videoUrl);
    let videoUrlParams;
    try {
      videoUrlParams = new URL(decodedVideoUrl);
    } catch (error) {
      console.error("Invalid URL:", error);
      const errorBody = JSON.stringify({ error: "Invalid videoUrl format" });
      responseStream.setContentType("application/json");
      responseStream.write(errorBody);
      responseStream.end();
      return;
    }

    const baseUrl = `${videoUrlParams.origin}${videoUrlParams.pathname}`;
    const expire = videoUrlParams.searchParams.get("expire");
    const l = videoUrlParams.searchParams.get("l");
    const policy = videoUrlParams.searchParams.get("policy");
    const signature = videoUrlParams.searchParams.get("signature");
    const tk = videoUrlParams.searchParams.get("tk");
    const tt_chain_token = videoUrlParams.searchParams.get("tt_chain_token")?.replaceAll(" ", "+") || "";

    // Validate required parameters
    if (!expire || !l || !policy || !signature || !tk || !tt_chain_token) {
        const errorBody = JSON.stringify({ error: "Missing required URL parameters" });
        responseStream.setContentType("application/json");
        responseStream.write(errorBody);
        responseStream.end();
        return;
    }

    // Construct final URL and Headers
    const TIKTOK_VIDEO_URL = `${baseUrl}?expire=${expire}&l=${l}&policy=${policy}&signature=${signature}&tk=${tk}`;
    const TIKTOK_COOKIE = `tt_chain_token=${tt_chain_token};`;

    const response = await fetch(TIKTOK_VIDEO_URL, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        cookie: TIKTOK_COOKIE,
        origin: "https://www.tiktok.com",
        pragma: "no-cache",
        priority: "u=1, i",
        referer: "https://www.tiktok.com/",
        "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`);
    }

    // Set Response Headers
    const metadata = {
      statusCode: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "video/mp4",
         // Adjust filename to include ssdown-tiktok- prefix safely
        "Content-Disposition": `attachment; filename="ssdown-tiktok-${filename.replace(/[^a-zA-Z0-9_-]/g, '')}.mp4"`,
        "Cache-Control": "public, max-age=3600"
      }
    };
    
    // Set headers for the response stream
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

    // Pipeline the stream
    if (response.body) {
        const nodeStream = Readable.fromWeb(response.body);
        await pipeline(nodeStream, responseStream);
    } else {
        responseStream.end();
    }

  } catch (error) {
    console.error("Download Error:", error);
    if (!responseStream.headersSent) {
        responseStream = awslambda.HttpResponseStream.from(responseStream, { statusCode: 500 });
    }
    responseStream.write("Internal Server Error");
    responseStream.end();
  }
});
