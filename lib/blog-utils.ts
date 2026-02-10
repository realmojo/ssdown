import { Post } from "./posts/types";
import { supabase } from "./supabase";

export type { Post };

function resolveField(field: string | Record<string, string>): string {
  if (typeof field === "string") return field;
  return field.en || Object.values(field)[0] || "";
}

// Supabase에서 Post 데이터를 가져와서 Post 타입으로 변환
function transformSupabasePost(data: any): Post {
  return {
    id: data.id,
    title: data.title || "",
    excerpt: data.excerpt || "",
    content: data.content || "",
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

import { staticPosts } from "./posts";

export async function getAllPosts(): Promise<Post[] | any> {
  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts from Supabase:", error);
    }

    return (data || []).map(transformSupabasePost);
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    return [];
  }
}

export async function getAllSitemapPosts(): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts || [];
}

export async function getPostById(id: string): Promise<Post | undefined> {
  // First try to find in static posts (faster/cheaper)
  const staticPost = staticPosts.find((p) => p.id === id);
  if (staticPost) {
    return {
      ...staticPost,
      title: resolveField(staticPost.title),
      excerpt: resolveField(staticPost.excerpt),
      content: resolveField(staticPost.content),
    };
  }

  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      console.error("Error fetching post from Supabase:", error);
      return undefined;
    }

    return data ? transformSupabasePost(data) : undefined;
  } catch (error) {
    console.error("Error in getPostById:", error);
    return undefined;
  }
}

export async function getPostsByCategory(
  category: string,
): Promise<Post[] | any> {
  // Static filter
  const staticFiltered = staticPosts.filter((p) => p.category === category);

  try {
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("category", category)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return staticFiltered;
    }

    // Merge static and dynamic? Or just prioritize dynamic.
    // For now, if dynamic exists, use it. If not, fallback to static.
    // Ideally we merge them, but to avoid ID conflicts, let's fallback.
    return (data || []).map(transformSupabasePost);
  } catch (error) {
    console.error("Error in getPostsByCategory:", error);
    return [];
  }
}

export async function getPostsByTag(tag: string): Promise<Post[] | any> {
  try {
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
    return [];
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

    if (error || !data || data.length === 0) {
      return staticPosts.slice(0, limit);
    }

    return (data || []).map(transformSupabasePost);
  } catch (error) {
    console.error("Error in getLatestPosts:", error);
    return [];
  }
}
