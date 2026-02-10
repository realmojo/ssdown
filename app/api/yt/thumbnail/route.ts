import { NextRequest, NextResponse } from "next/server";

const getYoutubeId = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    // Handle youtu.be/ID
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }

    // Handle youtube.com
    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("m.youtube.com")
    ) {
      // Handle /shorts/ID
      if (parsed.pathname.includes("/shorts/")) {
        const parts = parsed.pathname.split("/shorts/");
        return parts[1].split("/")[0]; // Remove trailing slash if exists
      }

      // Handle /watch?v=ID
      if (parsed.searchParams.has("v")) {
        return parsed.searchParams.get("v");
      }

      // Handle /embed/ID, /v/ID
      if (
        parsed.pathname.startsWith("/embed/") ||
        parsed.pathname.startsWith("/v/")
      ) {
        const parts = parsed.pathname.split("/");
        return parts[2];
      }
    }

    return null;
  } catch {
    return null;
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const id = getYoutubeId(url);

  if (!id) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const targetUrl = `https://www.youtube.com/watch?v=${id}`;
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from YouTube. Status: ${response.status}` },
        { status: response.status },
      );
    }

    const html = await response.text();

    // Look for ytInitialPlayerResponse
    const startPattern = "var ytInitialPlayerResponse = ";
    const startIndex = html.indexOf(startPattern);

    if (startIndex === -1) {
      return NextResponse.json({
        id,
        url: targetUrl,
        status: "success",
        message: "ytInitialPlayerResponse not found in page content",
      });
    }

    const startOfJson = startIndex + startPattern.length;

    // Find the end of the JSON object.
    // Usually it ends with };var or };<
    // A simple way is to count braces, but for speed/simplicity let's try finding the next semicolon or script tag closure
    // that balances the braces.
    // However, since it's a variable assignment, let's assume it ends at the first }; that is at the root level.

    let balance = 0;
    let endOfJson = -1;
    let inString = false;
    let escape = false;

    // We start parsing from startOfJson
    for (let i = startOfJson; i < html.length; i++) {
      const char = html[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (char === "\\") {
        escape = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") {
          balance++;
        } else if (char === "}") {
          balance--;
          if (balance === 0) {
            endOfJson = i + 1; // Include the closing brace
            break;
          }
        }
      }
    }

    if (endOfJson === -1) {
      return NextResponse.json(
        {
          id,
          url: targetUrl,
          status: "error",
          message: "Could not parse ytInitialPlayerResponse JSON",
        },
        { status: 500 },
      );
    }

    const jsonString = html.substring(startOfJson, endOfJson);

    try {
      const data = JSON.parse(jsonString);
      const category = data.microformat?.playerMicroformatRenderer?.category;

      return NextResponse.json({
        id,
        url: targetUrl,
        status: "success",
        data: {
          ...data.videoDetails,
          category,
        },
      });
    } catch {
      return NextResponse.json(
        {
          id,
          url: targetUrl,
          status: "error",
          message: "Failed to parse JSON",
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("YouTube Fetch Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch info" },
      { status: 500 },
    );
  }
}
