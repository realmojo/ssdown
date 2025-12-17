import { Post } from "./posts/types";

export type { Post };

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

import { ALL_POSTS as STATIC_POSTS } from "./posts/all-posts";

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
