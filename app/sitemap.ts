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
    {
      url: `${baseUrl}/tools/youtube-thumbnail`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/youtube-preview`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/video-to-mp3`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/thumbnail-generator`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/hashtag-generator`,
      lastModified: "2026-01-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/watermark-remover`,
      lastModified: "2026-01-01",
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
