import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ssdown.app";

  const { getAllSitemapPosts } = await import("@/lib/blog-utils");
  const posts = await getAllSitemapPosts();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: "2026-01-01",
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/x`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tiktok`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instagram`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/facebook`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dailymotion`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/9gag`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: "2026-01-01",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Category pages
    {
      url: `${baseUrl}/tools/image`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/video-audio`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/social-text`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/utility`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Image tools
    {
      url: `${baseUrl}/image/image-compressor`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/image-converter`,
      lastModified: "2026-02-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/social-image-resizer`,
      lastModified: "2026-02-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/watermark-remover`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/favicon-generator`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/color-palette-extractor`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/thumbnail-generator`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/background-remover`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/crop-image`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/flip-image`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/pixelate-image`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/black-and-white`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/add-text-to-image`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/add-border-to-image`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/combine-images`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/collage-maker`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/round-image-maker`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/image-metadata-viewer`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/blur-image`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image/icon-to-png`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Video & Audio tools
    {
      url: `${baseUrl}/video-audio/video-to-mp3`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-audio/video-to-gif`,
      lastModified: "2026-02-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-audio/video-frame-extractor`,
      lastModified: "2026-02-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-audio/audio-trimmer`,
      lastModified: "2026-02-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-audio/mute-video`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-audio/gif-to-mp4`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-audio/trim-video`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Social & Text tools
    {
      url: `${baseUrl}/social-text/hashtag-generator`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/social-text/instagram-line-break`,
      lastModified: "2026-02-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Utility tools
    {
      url: `${baseUrl}/utility/youtube-thumbnail`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/utility/youtube-preview`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/utility/qr-code-generator`,
      lastModified: "2026-02-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/utility/aspect-ratio-calculator`,
      lastModified: "2026-02-11",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // PDF tools
    {
      url: `${baseUrl}/pdf/merge-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/rotate-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/delete-pdf-pages`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/protect-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/unlock-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/pdf-to-text`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/split-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/rearrange-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/crop-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/pdf-page-numbers`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/pdf-watermark`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/add-text-to-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/create-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/images-to-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/pdf-to-jpg`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/pdf-to-png`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/pdf-editor`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pdf/esign-pdf`,
      lastModified: "2026-02-12",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // File & Data tools
    {
      url: `${baseUrl}/tools/file`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/file/json-to-xml`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/xml-to-json`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/csv-to-json`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/csv-to-xml`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/xml-to-csv`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/csv-to-excel`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/excel-to-csv`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/xml-to-excel`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/excel-to-xml`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/split-csv`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/split-excel`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/file/excel-to-pdf`,
      lastModified: "2026-02-13",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: "2026-01-01",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: "2026-01-01",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: "2026-01-01",
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: "2026-01-01",
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
