import { getAllSitemapPosts } from "@/lib/posts";

export const runtime = "edge";

const baseUrl = "https://ssdown.app";

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
    const loc = `${baseUrl}${route}`;
    const priority = route === "" ? "1.0" : "0.8";

    urls.push(`
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${priority}</priority>
    </url>`);
  });

  // 2. Blog Posts
  try {
    const posts = await getAllSitemapPosts();

    posts.forEach((post) => {
      const lastModified = post.updatedAt
        ? new Date(post.updatedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const route = `/blog/${post.id}`;
      const loc = `${baseUrl}${route}`;

      urls.push(`
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`);
    });
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
