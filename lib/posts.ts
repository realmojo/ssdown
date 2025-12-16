import { supabase } from "./supabase";

export interface Post {
  id: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt: string;
  image: string;
  readTime: number;
  status?: string;
  createdAt?: string;
}

// 언어 fallback 헬퍼 함수: en과 kr만 지원, 나머지는 en으로 fallback
export function getLocalizedContent(
  content: Record<string, string>,
  lang: string
): string {
  // en과 kr만 직접 지원
  if (lang === "en" || lang === "kr") {
    return content[lang] || content["en"] || "";
  }
  // 나머지 언어는 모두 en으로 fallback
  return content["en"] || "";
}

// Supabase에서 가져온 데이터를 Post 인터페이스로 변환
function transformPost(data: any): Post {
  return {
    id: data.id,
    title: typeof data.title === "string" ? JSON.parse(data.title) : data.title,
    excerpt:
      typeof data.excerpt === "string"
        ? JSON.parse(data.excerpt)
        : data.excerpt,
    content:
      typeof data.content === "string"
        ? JSON.parse(data.content)
        : data.content,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author,
    publishedAt: data.published_at || data.publishedAt,
    updatedAt: data.updated_at || data.updatedAt,
    image: data.image || "/logo.png",
    readTime: data.read_time || data.readTime || 5,
    status: data.status || "published",
    createdAt: data.created_at || data.createdAt,
  };
}

import { STATIC_POSTS } from "./static-posts";

export async function getAllPosts(): Promise<Post[]> {
  // Static data for now
  return STATIC_POSTS;
}

export async function getAllSitemapPosts(): Promise<Post[]> {
  return STATIC_POSTS;
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const post = STATIC_POSTS.find((p) => p.id === id);
  return post;
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  return STATIC_POSTS.filter((p) => p.category === category);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  return STATIC_POSTS.filter((p) => p.tags.includes(tag));
}

export async function getLatestPosts(limit: number = 5): Promise<Post[]> {
  return STATIC_POSTS.slice(0, limit);
}
