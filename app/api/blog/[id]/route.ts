import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    // 특정 ID의 블로그 포스트 조회
    const { data, error } = await supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (error) {
      console.error("Error fetching blog post:", error);

      // 404 처리
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch blog post", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // 데이터 변환 (JSONB 필드 처리)
    const transformedData = {
      id: data.id,
      title:
        typeof data.title === "string" ? JSON.parse(data.title) : data.title,
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
      createdAt: data.created_at || data.createdAt,
      image: data.image || "/logo.png",
      readTime: data.read_time || data.readTime || 5,
      status: data.status || "published",
    };

    return NextResponse.json(
      {
        success: true,
        data: transformedData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in GET /api/blog/[id]:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
