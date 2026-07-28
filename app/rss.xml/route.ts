export const revalidate = 3600;

const BASE = "https://ssdown.app";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { getAllSitemapPosts } = await import("@/lib/blog-utils");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts: any[] = await getAllSitemapPosts();

  const items = posts
    .slice(0, 100)
    .map((p) => {
      const title = escapeXml(String(p.title));
      const description = escapeXml(String(p.excerpt || ""));
      const link = `${BASE}/blog/${p.id}`;
      const pubDate = new Date(p.publishedAt || p.published_at).toUTCString();
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SSDown 블로그 — Free Online Tools &amp; Guides</title>
    <link>${BASE}/blog</link>
    <description>Technology guides and tutorials on video downloading, image editing, PDF management, file conversion, and digital security.</description>
    <language>en-us</language>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
