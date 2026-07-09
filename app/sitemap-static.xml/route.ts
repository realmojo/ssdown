export const revalidate = 3600;

const BASE = "https://ssdown.app";

type Entry = { url: string; lastmod: string; changefreq: string; priority: number };

const STATIC: Entry[] = [
  { url: BASE,                                  lastmod: "2026-01-01", changefreq: "weekly",  priority: 1.0 },
  { url: `${BASE}/douyin`,                      lastmod: "2026-03-19", changefreq: "weekly",  priority: 0.9 },
  { url: `${BASE}/kuaishou`,                    lastmod: "2026-03-20", changefreq: "weekly",  priority: 0.9 },
  { url: `${BASE}/x`,                           lastmod: "2026-05-15", changefreq: "weekly",  priority: 0.9 },
  { url: `${BASE}/tiktok`,                      lastmod: "2026-05-15", changefreq: "weekly",  priority: 0.9 },
  { url: `${BASE}/instagram`,                   lastmod: "2026-05-15", changefreq: "weekly",  priority: 0.9 },
  { url: `${BASE}/facebook`,                    lastmod: "2026-05-15", changefreq: "weekly",  priority: 0.9 },
  { url: `${BASE}/dailymotion`,                 lastmod: "2026-05-15", changefreq: "weekly",  priority: 0.9 },
  { url: `${BASE}/9gag`,                        lastmod: "2026-05-15", changefreq: "weekly",  priority: 0.9 },
  { url: `${BASE}/blog`,                        lastmod: "2026-01-01", changefreq: "daily",   priority: 0.9 },
  { url: `${BASE}/tools`,                       lastmod: "2026-01-01", changefreq: "monthly", priority: 0.7 },
  { url: `${BASE}/tools/image`,                 lastmod: "2026-02-12", changefreq: "monthly", priority: 0.7 },
  { url: `${BASE}/tools/video-audio`,           lastmod: "2026-02-12", changefreq: "monthly", priority: 0.7 },
  { url: `${BASE}/tools/social-text`,           lastmod: "2026-02-12", changefreq: "monthly", priority: 0.7 },
  { url: `${BASE}/tools/utility`,               lastmod: "2026-02-12", changefreq: "monthly", priority: 0.7 },
  { url: `${BASE}/tools/pdf`,                   lastmod: "2026-02-12", changefreq: "monthly", priority: 0.7 },
  { url: `${BASE}/tools/file`,                  lastmod: "2026-02-13", changefreq: "monthly", priority: 0.7 },
  // Image
  { url: `${BASE}/image/image-compressor`,      lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/image-converter`,       lastmod: "2026-02-11", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/social-image-resizer`,  lastmod: "2026-02-11", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/watermark-remover`,     lastmod: "2026-01-01", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/favicon-generator`,     lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/color-palette-extractor`, lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/thumbnail-generator`,   lastmod: "2026-01-01", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/background-remover`,    lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/crop-image`,            lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/flip-image`,            lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/pixelate-image`,        lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/black-and-white`,       lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/add-text-to-image`,     lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/add-border-to-image`,   lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/combine-images`,        lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/collage-maker`,         lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/round-image-maker`,     lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/image-metadata-viewer`, lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/blur-image`,            lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/image/icon-to-png`,           lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  // Video & Audio
  { url: `${BASE}/video-audio/video-to-mp3`,    lastmod: "2026-01-01", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/video-audio/video-to-gif`,    lastmod: "2026-02-11", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/video-audio/video-frame-extractor`, lastmod: "2026-02-11", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/video-audio/audio-trimmer`,   lastmod: "2026-02-11", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/video-audio/mute-video`,      lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/video-audio/gif-to-mp4`,      lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/video-audio/trim-video`,      lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  // Social & Text
  { url: `${BASE}/social-text/hashtag-generator`,     lastmod: "2026-01-01", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/social-text/instagram-line-break`,  lastmod: "2026-02-11", changefreq: "monthly", priority: 0.8 },
  // Utility
  { url: `${BASE}/utility/qr-code-generator`,   lastmod: "2026-02-11", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/utility/aspect-ratio-calculator`, lastmod: "2026-02-11", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/utility/word-counter`,        lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/utility/share-debugger`,      lastmod: "2026-07-03", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/utility/mp3-splitter`,        lastmod: "2026-07-10", changefreq: "monthly", priority: 0.8 },
  // PDF
  { url: `${BASE}/pdf/merge-pdf`,       lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/rotate-pdf`,      lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/delete-pdf-pages`,lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/protect-pdf`,     lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/unlock-pdf`,      lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/pdf-to-text`,     lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/split-pdf`,       lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/rearrange-pdf`,   lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/crop-pdf`,        lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/pdf-page-numbers`,lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/pdf-watermark`,   lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/add-text-to-pdf`, lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/create-pdf`,      lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/images-to-pdf`,   lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/pdf-to-jpg`,      lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/pdf-to-png`,      lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/pdf-editor`,      lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/pdf/esign-pdf`,       lastmod: "2026-02-12", changefreq: "monthly", priority: 0.8 },
  // File
  { url: `${BASE}/file/json-to-xml`,    lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/xml-to-json`,    lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/csv-to-json`,    lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/csv-to-xml`,     lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/xml-to-csv`,     lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/csv-to-excel`,   lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/excel-to-csv`,   lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/xml-to-excel`,   lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/excel-to-xml`,   lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/split-csv`,      lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/split-excel`,    lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  { url: `${BASE}/file/excel-to-pdf`,   lastmod: "2026-02-13", changefreq: "monthly", priority: 0.8 },
  // Static
  { url: `${BASE}/about`,   lastmod: "2026-01-01", changefreq: "yearly", priority: 0.3 },
  { url: `${BASE}/contact`, lastmod: "2026-01-01", changefreq: "yearly", priority: 0.3 },
  { url: `${BASE}/privacy`, lastmod: "2026-01-01", changefreq: "yearly", priority: 0.2 },
  { url: `${BASE}/terms`,   lastmod: "2026-01-01", changefreq: "yearly", priority: 0.2 },
];

function buildXml(entries: Entry[]): string {
  const rows = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.url}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>`;
}

export async function GET() {
  const { getAllSitemapPosts } = await import("@/lib/blog-utils");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts: any[] = await getAllSitemapPosts();

  const blogEntries: Entry[] = posts.map((p) => ({
    url: `${BASE}/blog/${p.id}`,
    lastmod: new Date(p.updatedAt || p.publishedAt).toISOString().split("T")[0],
    changefreq: "monthly",
    priority: 0.7,
  }));

  return new Response(buildXml([...STATIC, ...blogEntries]), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
