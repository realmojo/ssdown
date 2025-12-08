import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || "";

    // 기본 쿼리 구성
    let query = supabase
      .from("ssdown_blogs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    // 카테고리 필터 적용
    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching blogs:", error);
      return NextResponse.json(
        { error: "Failed to fetch blogs", details: error.message },
        { status: 500 }
      );
    }

    // 데이터 변환 (JSONB 필드 처리)
    const transformedData = (data || []).map((item: any) => {
      return {
        id: item.id,
        title:
          typeof item.title === "string" ? JSON.parse(item.title) : item.title,
        excerpt:
          typeof item.excerpt === "string"
            ? JSON.parse(item.excerpt)
            : item.excerpt,
        content:
          typeof item.content === "string"
            ? JSON.parse(item.content)
            : item.content,
        category: item.category,
        tags: Array.isArray(item.tags) ? item.tags : [],
        author: item.author,
        publishedAt: item.published_at || item.publishedAt,
        updatedAt: item.updated_at || item.updatedAt,
        createdAt: item.created_at || item.createdAt,
        image: item.image || "/logo.png",
        readTime: item.read_time || item.readTime || 5,
        status: item.status || "published",
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: transformedData,
        count: transformedData.length,
        category: category || "all",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in GET /api/blog/list:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
