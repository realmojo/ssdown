import { NextResponse } from "next/server";
import { i18n } from "@/lib/i18n-config";

const baseUrl = "https://ssdown.app";

export async function GET() {
  const routes = [
    "",
    "/x",
    "/tiktok",
    "/instagram",
    "/facebook",
    "/privacy",
    "/terms",
    "/about",
    "/contact",
  ];
  const urls: string[] = [];

  routes.forEach((route) => {
    // English (default) - Served at root URLs
    const priority = route === "" ? "1.0" : "0.8";
    const url = `${baseUrl}${route}`;
    const lastModified = new Date().toISOString().split("T")[0];

    urls.push(`
    <url>
      <loc>${url}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${priority}</priority>
    </url>`);

    // Other languages - Served at /locale URLs
    i18n.locales.forEach((locale) => {
      if (locale === "en") return; // Skip English as it's handled at root
      const langPriority = route === "" ? "0.9" : "0.7";
      const langUrl = `${baseUrl}/${locale}${route}`;

      urls.push(`
    <url>
      <loc>${langUrl}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${langPriority}</priority>
    </url>`);
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${urls.join(
    ""
  )}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
