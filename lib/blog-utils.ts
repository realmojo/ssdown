import { Post } from "./posts/types";
import { supabase } from "./supabase";

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

// Supabase에서 Post 데이터를 가져와서 Post 타입으로 변환
function transformSupabasePost(data: any): Post {
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
    author: data.author || "SSDown Team",
    publishedAt: data.published_at || data.publishedAt,
    updatedAt: data.updated_at || data.updatedAt,
    createdAt: data.created_at || data.createdAt,
    image: data.image || "/logo.png",
    readTime: data.read_time || data.readTime || 5,
    status: data.status || "published",
  };
}

export async function getAllPosts(): Promise<Post[] | any> {
  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts from Supabase:", error);
      // Fallback to static data if Supabase fails
    }

    return (data || []).map(transformSupabasePost);
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    // Fallback to static data
  }
}

export async function getAllSitemapPosts(): Promise<Post[]> {
  return getAllPosts() || [];
}

export async function getPostById(id: string): Promise<Post | undefined> {
  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return undefined;
      }
      console.error("Error fetching post from Supabase:", error);
    }

    return data ? transformSupabasePost(data) : undefined;
  } catch (error) {
    console.error("Error in getPostById:", error);
  }
}

export async function getPostsByCategory(
  category: string
): Promise<Post[] | any> {
  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("category", category)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts by category from Supabase:", error);
    }

    return (data || []).map(transformSupabasePost);
  } catch (error) {
    console.error("Error in getPostsByCategory:", error);
  }
}

export async function getPostsByTag(tag: string): Promise<Post[] | any> {
  try {
    // Supabase에서 배열 필드에 특정 값이 포함된 행을 찾기 위해 .cs (contains) 연산자 사용
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("status", "published")
      .filter("tags", "cs", `{${tag}}`)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts by tag from Supabase:", error);
    }

    return (data || []).map(transformSupabasePost);
  } catch (error) {
    console.error("Error in getPostsByTag:", error);
  }
}

export async function getLatestPosts(limit: number = 5): Promise<Post[] | any> {
  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching latest posts from Supabase:", error);
    }

    return (data || []).map(transformSupabasePost);
  } catch (error) {
    console.error("Error in getLatestPosts:", error);
  }
}
