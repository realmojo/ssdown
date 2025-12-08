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

export async function getAllPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return (data || []).map(transformPost);
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    return [];
  }
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
      console.error("Error fetching post:", error);
      return undefined;
    }

    if (!data) return undefined;

    return transformPost(data);
  } catch (error) {
    console.error("Error in getPostById:", error);
    return undefined;
  }
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("category", category)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts by category:", error);
      return [];
    }

    return (data || []).map(transformPost);
  } catch (error) {
    console.error("Error in getPostsByCategory:", error);
    return [];
  }
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("status", "published")
      .contains("tags", [tag])
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts by tag:", error);
      return [];
    }

    return (data || []).map(transformPost);
  } catch (error) {
    console.error("Error in getPostsByTag:", error);
    return [];
  }
}

export async function getLatestPosts(limit: number = 5): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching latest posts:", error);
      return [];
    }

    return (data || []).map(transformPost);
  } catch (error) {
    console.error("Error in getLatestPosts:", error);
    return [];
  }
}
