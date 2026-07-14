import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "edge";

// 사설/루프백 대역 차단 (SSRF 방지)
function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) {
    return true;
  }

  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }

  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) {
    return true;
  }

  return false;
}

function normalizeTargetUrl(input: string): URL | null {
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isPrivateHostname(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

function absolutize(base: string, maybeRelative?: string | null): string | undefined {
  if (!maybeRelative) return undefined;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return undefined;
  }
}

interface MetaTag {
  attr: "property" | "name";
  key: string;
  content: string;
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const target = normalizeTargetUrl(rawUrl.trim());
  if (!target) {
    return NextResponse.json(
      { error: "invalid_url", message: "Enter a valid public http(s) URL" },
      { status: 400 }
    );
  }

  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        // 대부분의 사이트가 크롤러에게만 OG 태그를 완전히 렌더링해주므로 소셜 봇 UA 사용
        "user-agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "fetch_failed", message: e?.message || "Could not reach the URL" },
      { status: 200 }
    );
  }

  const finalUrl = response.url || target.toString();
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "http_error",
        message: `Server responded with ${response.status}`,
        statusCode: response.status,
        finalUrl,
      },
      { status: 200 }
    );
  }

  if (!contentType.includes("text/html")) {
    return NextResponse.json(
      {
        error: "not_html",
        message: `Response is not HTML (${contentType || "unknown content type"})`,
        statusCode: response.status,
        finalUrl,
      },
      { status: 200 }
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const tags: MetaTag[] = [];
  $("meta").each((_, el) => {
    const $el = $(el);
    const property = $el.attr("property");
    const name = $el.attr("name");
    const content = $el.attr("content");
    if (content === undefined) return;
    if (property) tags.push({ attr: "property", key: property, content });
    else if (name) tags.push({ attr: "name", key: name, content });
  });

  const getMeta = (key: string) =>
    tags.find((t) => t.key.toLowerCase() === key.toLowerCase())?.content;

  const pageTitle = $("title").first().text().trim() || undefined;
  const canonical = $('link[rel="canonical"]').attr("href");
  const favicon =
    $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href");

  const openGraph = {
    title: getMeta("og:title"),
    description: getMeta("og:description"),
    image: absolutize(finalUrl, getMeta("og:image")),
    imageWidth: getMeta("og:image:width"),
    imageHeight: getMeta("og:image:height"),
    imageAlt: getMeta("og:image:alt"),
    url: getMeta("og:url"),
    type: getMeta("og:type"),
    siteName: getMeta("og:site_name"),
    locale: getMeta("og:locale"),
  };

  const twitter = {
    card: getMeta("twitter:card"),
    title: getMeta("twitter:title"),
    description: getMeta("twitter:description"),
    image: absolutize(finalUrl, getMeta("twitter:image") || getMeta("twitter:image:src")),
    site: getMeta("twitter:site"),
    creator: getMeta("twitter:creator"),
  };

  const basic = {
    title: pageTitle,
    description: getMeta("description"),
    canonical: absolutize(finalUrl, canonical),
    favicon: absolutize(finalUrl, favicon || "/favicon.ico"),
    themeColor: getMeta("theme-color"),
  };

  const displayTitle = openGraph.title || basic.title;
  const displayDescription = openGraph.description || basic.description;

  const warnings: { level: "error" | "warning"; message: string }[] = [];
  if (!displayTitle) {
    warnings.push({ level: "error", message: "No title found (og:title or <title>)" });
  }
  if (!displayDescription) {
    warnings.push({
      level: "error",
      message: "No description found (og:description or meta description)",
    });
  }
  if (!openGraph.image) {
    warnings.push({
      level: "error",
      message: "Missing og:image — most platforms won't show a preview image",
    });
  } else if (!openGraph.imageWidth || !openGraph.imageHeight) {
    warnings.push({
      level: "warning",
      message: "og:image:width / og:image:height not set — some crawlers may skip the image",
    });
  }
  if (!openGraph.type) {
    warnings.push({ level: "warning", message: "Missing og:type" });
  }
  if (!openGraph.siteName) {
    warnings.push({ level: "warning", message: "Missing og:site_name" });
  }
  if (!twitter.card) {
    warnings.push({
      level: "warning",
      message: "Missing twitter:card — X/Twitter will fall back to Open Graph tags",
    });
  }
  if (displayTitle && displayTitle.length > 60) {
    warnings.push({
      level: "warning",
      message: `Title is ${displayTitle.length} characters — may be truncated (recommended ≤ 60)`,
    });
  }
  if (displayDescription && displayDescription.length > 160) {
    warnings.push({
      level: "warning",
      message: `Description is ${displayDescription.length} characters — may be truncated (recommended ≤ 160)`,
    });
  }

  return NextResponse.json({
    requestedUrl: target.toString(),
    finalUrl,
    redirected: finalUrl !== target.toString(),
    statusCode: response.status,
    fetchTimeMs: Date.now() - startedAt,
    basic,
    openGraph,
    twitter,
    tags,
    warnings,
  });
}
