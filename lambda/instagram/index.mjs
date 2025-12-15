import { Readable } from "stream";
import { pipeline } from "stream/promises";

/**
 * AWS Lambda Function URL (Streaming) Handler
 * Node.js 18.x or 20.x Runtime required
 *
 * IMPORTANT: This function MUST be configured with "Invoke Mode: RESPONSE_STREAM"
 * when creating the Function URL.
 */
export const handler = awslambda.streamifyResponse(
  async (event, responseStream, _context) => {
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
      const response = await fetch(videoUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`);
      }

      // Set Response Headers
      const metadata = {
        statusCode: 200,
        headers: {
          "Content-Type": response.headers.get("content-type") || "video/mp4",
          "Content-Disposition": `attachment; filename="ssdown-instagram-${filename}.mp4"`,
          "Cache-Control": "public, max-age=3600",
        },
      };

      // Set headers for the response stream
      responseStream = awslambda.HttpResponseStream.from(
        responseStream,
        metadata
      );

      // Convert Web Stream (fetch) to Node Stream and pipeline to response
      if (response.body) {
        // Node.js 18+ provides Readable.fromWeb to convert Web ReadableStream to Node Readable
        const nodeStream = Readable.fromWeb(response.body);
        await pipeline(nodeStream, responseStream);
      } else {
        responseStream.end();
      }
    } catch (error) {
      console.error("Download Error:", error);
      // Note: If headers are already sent, this might write error into the file stream
      // Ideally we catch errors early.
      if (!responseStream.headersSent) {
        responseStream = awslambda.HttpResponseStream.from(responseStream, {
          statusCode: 500,
        });
      }
      responseStream.write("Internal Server Error");
      responseStream.end();
    }
  }
);
