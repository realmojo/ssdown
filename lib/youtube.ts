export const getYoutubeId = (url: string): string | null => {
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

export interface VideoDetails {
  videoId: string;
  title: string;
  lengthSeconds: string;
  channelId: string;
  shortDescription: string;
  keywords?: string[];
  thumbnail: {
    thumbnails: { url: string; width: number; height: number }[];
  };
  viewCount: string;
  author: string;
  category?: string;
}

export async function fetchVideoDetails(
  videoId: string,
): Promise<VideoDetails | null> {
  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const startPattern = "var ytInitialPlayerResponse = ";
  const startIndex = html.indexOf(startPattern);

  if (startIndex === -1) {
    return null;
  }

  const startOfJson = startIndex + startPattern.length;
  let balance = 0;
  let endOfJson = -1;
  let inString = false;
  let escape = false;

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
          endOfJson = i + 1;
          break;
        }
      }
    }
  }

  if (endOfJson === -1) {
    return null;
  }

  try {
    const jsonString = html.substring(startOfJson, endOfJson);
    const data = JSON.parse(jsonString);
    const category = data.microformat?.playerMicroformatRenderer?.category;

    return {
      ...data.videoDetails,
      category,
    };
  } catch {
    return null;
  }
}
