import { NextResponse } from "next/server";
import { i18n } from "@/lib/i18n-config";
import { getAllSitemapPosts } from "@/lib/posts";

export const runtime = "edge";

const baseUrl = "https://ssdown.app";

// Map internal URL locale codes to standard ISO 639-1 hreflang codes
const hreflangMap: Record<string, string> = {
  en: "en",
  jp: "ja",
  kr: "ko",
  pt: "pt",
  fr: "fr",
};

export async function GET() {
  const routes = [
    "",
    "/x",
    "/tiktok",
    "/instagram",
    "/facebook",
    "/9gag",
    "/dailymotion",
    "/privacy",
    "/terms",
    "/about",
    "/contact",
    "/blog",
  ];

  const urls: string[] = [];

  // 1. Static Routes
  routes.forEach((route) => {
    const lastModified = new Date().toISOString().split("T")[0];

    // Generate the block of <xhtml:link> tags that will be identical for every version of this route
    let alternates = "";

    // Add x-default (pointing to English/Root)
    alternates += `\n      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${route}"/>`;

    // Add specific language versions
    i18n.locales.forEach((locale) => {
      const href =
        locale === "en" ? `${baseUrl}${route}` : `${baseUrl}/${locale}${route}`;
      const hreflang = hreflangMap[locale] || locale;

      alternates += `\n      <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`;
    });

    // Generate the <url> entry for EACH locale (including English/Root)
    i18n.locales.forEach((locale) => {
      const loc =
        locale === "en" ? `${baseUrl}${route}` : `${baseUrl}/${locale}${route}`;

      const priority =
        locale === "en"
          ? route === ""
            ? "1.0"
            : "0.8"
          : route === ""
            ? "0.9"
            : "0.7";

      urls.push(`
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${priority}</priority>${alternates}
    </url>`);
    });
  });

  // 2. Blog Posts
  try {
    const posts = await getAllSitemapPosts();

    posts.forEach((post) => {
      const lastModified = post.updatedAt
        ? new Date(post.updatedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const route = `/blog/${post.id}`;

      // Generate alternates for this specific post
      let alternates = "";

      // x-default
      alternates += `\n      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${route}"/>`;

      // specific languages
      i18n.locales.forEach((locale) => {
        const href =
          locale === "en"
            ? `${baseUrl}${route}`
            : `${baseUrl}/${locale}${route}`;
        const hreflang = hreflangMap[locale] || locale;

        alternates += `\n      <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`;
      });

      // Generate <url> entry for EACH locale
      i18n.locales.forEach((locale) => {
        const loc =
          locale === "en"
            ? `${baseUrl}${route}`
            : `${baseUrl}/${locale}${route}`;

        urls.push(`
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>${alternates}
    </url>`);
      });
    });
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
