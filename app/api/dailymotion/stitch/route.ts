import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  const maxSegments = parseInt(searchParams.get("max") || "500", 10);

  if (!url) {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    );
  }

  // Create a ReadableStream to stream the data
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let segmentUrls: string[] = [];
        let initUrl: string | null = null;
        let baseUrl = "";

        // Case 1: M3U8 Manifest
        if (url.includes(".m3u8")) {
          const m3u8Res = await fetch(url);
          if (!m3u8Res.ok) throw new Error("Failed to fetch m3u8");
          const m3u8Text = await m3u8Res.text();
          
          // Base URL for relative paths
          baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

          // Extract Init Map (init.mp4)
          // #EXT-X-MAP:URI="init.mp4"
          const mapMatch = m3u8Text.match(/#EXT-X-MAP:URI="([^"]+)"/);
          if (mapMatch && mapMatch[1]) {
             initUrl = mapMatch[1].startsWith("http") ? mapMatch[1] : baseUrl + mapMatch[1];
          }

          // Extract Segments
          // Lines that do not start with # and are not empty
          const lines = m3u8Text.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
              const segUrl = trimmed.startsWith("http") ? trimmed : baseUrl + trimmed;
              segmentUrls.push(segUrl);
            }
          }

        } 
        // Case 2: Direct Init URL (Legacy manual mode)
        else if (url.includes("init.mp4")) {
           initUrl = url;
           baseUrl = url.replace("init.mp4", "");
           // Generate segment URLs (0.m4s, 1.m4s, ...)
           // Note: This relies on the loop below to fetch until 404, 
           // but since we are refactoring to a list, we'll generate the list here optimistically or use a flag.
           // For consistency, let's just push sequential numbers and let the fetcher handle it.
           for (let i = 0; i <= maxSegments; i++) {
             segmentUrls.push(`${baseUrl}${i}.m4s`);
           }
        } else {
           throw new Error("Invalid URL format. Must be .m3u8 or init.mp4");
        }

        // 1. Fetch Init Segment (if exists)
        if (initUrl) {
           const initRes = await fetch(initUrl);
           if (initRes.ok) {
             const initData = await initRes.arrayBuffer();
             controller.enqueue(new Uint8Array(initData));
           } else {
             console.error("Failed to fetch init segment:", initUrl);
           }
        }

        // 2. Fetch All Segments
        for (let i = 0; i < segmentUrls.length; i++) {
           // If we are in "Legacy" mode (generated list), we might hit 404s at the end.
           // If M3U8 mode, the list is exact.
           
           try {
             const segRes = await fetch(segmentUrls[i]);
             if (!segRes.ok) {
               if (segRes.status === 404) {
                 // Stop only if it's likely the end of a sequence
                 break; 
               }
               console.error(`Error fetching segment ${i}: ${segRes.status}`);
               continue; // Try next segment? or break? usually breaks.
             }
             const segData = await segRes.arrayBuffer();
             controller.enqueue(new Uint8Array(segData));
           } catch (e) {
             console.error(`Error fetching segment ${i}`, e);
             break;
           }
        }
        
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="dailymotion_stitched.mp4"`,
    },
  });
}
