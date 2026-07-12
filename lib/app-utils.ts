import { supabase } from "./supabase";
import { SoftwareApplication, PlatformType, LicenseType, SecurityStatus } from "@/types/app";
import { getCategoryBySlug } from "./categories";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformRow(row: any): SoftwareApplication {
  return {
    core: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameKr: row.name_kr ?? undefined,
      platform: row.platform as PlatformType,
      supportedPlatforms: (row.supported_platforms ?? []) as PlatformType[],
      developer: {
        name: row.developer_name ?? "",
        websiteUrl: row.developer_website_url ?? undefined,
      },
      category: {
        main: row.category_main ?? "",
        sub: row.category_sub ?? "",
      },
    },
    seo: {
      title: row.seo_title ?? "",
      description: row.seo_description ?? "",
      titleKr: row.seo_title_kr ?? undefined,
      descriptionKr: row.seo_description_kr ?? undefined,
      keywords: row.seo_keywords ?? [],
      ogImage: row.seo_og_image ?? "",
      structuredData: row.seo_structured_data ?? {},
    },
    download: {
      downloadUrl: row.download_url ?? "#",
      fileSize: row.file_size ?? "",
      license: (row.license ?? "Free") as LicenseType,
      price: row.price ?? undefined,
      currency: row.currency ?? undefined,
      security: {
        status: (row.security_status ?? "Unknown") as SecurityStatus,
        lastScannedAt: row.security_last_scanned_at ?? new Date().toISOString(),
      },
    },
    rating: {
      average: row.rating_average ?? 0,
      totalCount: row.rating_total_count ?? 0,
    },
    content: {
      iconUrl: row.icon_url ?? "",
      shortSummary: row.short_summary ?? "",
      shortSummaryKr: row.short_summary_kr ?? undefined,
      bodyHtml: row.body_html ?? "",
      editorReviewHtml: row.editor_review_html ?? "",
      aiReviewHtml: row.ai_review_html ?? "",
      aiReviewHtmlKr: row.ai_review_html_kr ?? undefined,
      pros: row.pros ?? [],
      cons: row.cons ?? [],
    },
    specs: {
      osRequirements: row.os_requirements ?? "",
      languages: row.languages ?? [],
      lastUpdatedDate: row.last_updated_date ?? new Date().toISOString(),
    },
    relations: {
      alternativesAppIds: [],
      relatedArticlesIds: [],
    },
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export async function getAppById(id: string): Promise<SoftwareApplication | null> {
  const { data, error } = await supabase
    .from("software_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return transformRow(data);
}

const CARD_COLUMNS = "id,slug,name,name_kr,platform,category_main,license,rating_average,rating_total_count,icon_url,short_summary,short_summary_kr,developer_name,download_url";

/**
 * locale이 'kr'이면 한국어 필드(name_kr, seo_*_kr, short_summary_kr, ai_review_html_kr)가
 * 존재하는 항목만 해당 값으로 덮어쓴 사본을 반환합니다. 영어(en)는 원본 그대로.
 */
export function localizeApp(app: SoftwareApplication, locale: string): SoftwareApplication {
  if (locale !== "kr") return app;
  return {
    ...app,
    core: {
      ...app.core,
      name: app.core.nameKr || app.core.name,
    },
    seo: {
      ...app.seo,
      title: app.seo.titleKr || app.seo.title,
      description: app.seo.descriptionKr || app.seo.description,
    },
    content: {
      ...app.content,
      shortSummary: app.content.shortSummaryKr || app.content.shortSummary,
      aiReviewHtml: app.content.aiReviewHtmlKr || app.content.aiReviewHtml,
    },
  };
}

export async function getAppsByPlatform(
  platform: string,
  limit = 60,
  offset = 0,
  categoryMain?: string
): Promise<{ apps: SoftwareApplication[]; total: number }> {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  const platformMap: Record<string, string> = { iphone: 'iOS', ios: 'iOS' };
  const normalized = platformMap[platform.toLowerCase()] ?? platformName;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function applyFilters(q: any) {
    q = q.eq("platform", normalized).not("ai_review_html", "is", null).neq("ai_review_html", "");
    if (categoryMain) q = q.eq("category_main", categoryMain);
    return q;
  }

  const [{ count, error: countError }, { data, error }] = await Promise.all([
    applyFilters(supabase.from("software_applications").select("id", { count: "exact", head: true })),
    applyFilters(supabase.from("software_applications").select(CARD_COLUMNS))
      .order("rating_average", { ascending: false })
      .range(offset, offset + limit - 1),
  ]);

  if (countError || error || !data) return { apps: [], total: 0 };
  return { apps: data.map(transformRow), total: count ?? data.length };
}

export async function getCategoriesForPlatform(platform: string): Promise<{ category_main: string; count: number }[]> {
  const platformMap: Record<string, string> = { iphone: 'iOS', ios: 'iOS' };
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  const normalized = platformMap[platform.toLowerCase()] ?? platformName;

  const { data, error } = await supabase
    .from("software_applications")
    .select("category_main")
    .eq("platform", normalized)
    .neq("category_main", "");

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.category_main) counts[row.category_main] = (counts[row.category_main] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([category_main, count]) => ({ category_main, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getAppsByCategory(
  categorySlug: string,
  limit = 20,
  offset = 0
): Promise<{ apps: SoftwareApplication[]; total: number }> {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { apps: [], total: 0 };

  const orFilter = category.aliases.map((alias) => `category_main.ilike.%${alias}%`).join(",");

  const [{ count, error: countError }, { data, error }] = await Promise.all([
    supabase.from("software_applications").select("id", { count: "exact", head: true }).or(orFilter).not("ai_review_html", "is", null).neq("ai_review_html", ""),
    supabase.from("software_applications").select(CARD_COLUMNS).or(orFilter).not("ai_review_html", "is", null).neq("ai_review_html", "").order("rating_average", { ascending: false }).range(offset, offset + limit - 1),
  ]);

  if (countError || error || !data) return { apps: [], total: 0 };
  return { apps: data.map(transformRow), total: count ?? data.length };
}

export async function searchApps(params: {
  os?: string;
  license?: string;
  category?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ apps: SoftwareApplication[]; total: number }> {
  const { os, license, category, q, limit = 24, offset = 0 } = params;

  const platformMap: Record<string, string> = { iphone: "iOS", ios: "iOS" };

  function buildQuery(head = false) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let qb: any = supabase
      .from("software_applications")
      .select(head ? "id" : CARD_COLUMNS, head ? { count: "exact", head: true } : { count: "exact" });

    if (os) {
      const normalized = platformMap[os.toLowerCase()] ?? (os.charAt(0).toUpperCase() + os.slice(1).toLowerCase());
      qb = qb.eq("platform", normalized);
    }
    if (license) {
      qb = qb.ilike("license", license);
    }
    if (category) {
      const cat = getCategoryBySlug(category);
      if (cat) {
        const orFilter = cat.aliases.map((a) => `category_main.ilike.%${a}%`).join(",");
        qb = qb.or(orFilter);
      }
    }
    if (q) {
      qb = qb.or(`name.ilike.%${q}%,short_summary.ilike.%${q}%`);
    }
    return qb;
  }

  const [{ count, error: countErr }, { data, error }] = await Promise.all([
    buildQuery(true),
    buildQuery().order("rating_average", { ascending: false }).range(offset, offset + limit - 1),
  ]);

  if (countErr || error || !data) return { apps: [], total: 0 };
  return { apps: data.map(transformRow), total: count ?? data.length };
}

export async function getAlternatives(
  app: SoftwareApplication,
  limit = 12
): Promise<SoftwareApplication[]> {
  const ALT_COLUMNS = "id,slug,name,name_kr,platform,category_main,license,rating_average,rating_total_count,icon_url,short_summary,short_summary_kr,developer_name,download_url";

  // 같은 카테고리 + 같은 플랫폼
  const { data: sameCat } = await supabase
    .from("software_applications")
    .select(ALT_COLUMNS)
    .eq("category_main", app.core.category.main)
    .eq("platform", app.core.platform)
    .neq("id", app.core.id)
    .not("ai_review_html", "is", null)
    .neq("ai_review_html", "")
    .order("rating_average", { ascending: false })
    .limit(limit);

  const results = sameCat ?? [];
  if (results.length >= limit) return results.map(transformRow);

  // 부족하면 같은 플랫폼 다른 카테고리로 채움
  const existingIds = results.map((r) => r.id);
  const remaining = limit - results.length;
  const { data: crossCat } = await supabase
    .from("software_applications")
    .select(ALT_COLUMNS)
    .eq("platform", app.core.platform)
    .neq("category_main", app.core.category.main)
    .neq("id", app.core.id)
    .not("id", "in", `(${existingIds.join(",")})`)
    .not("ai_review_html", "is", null)
    .neq("ai_review_html", "")
    .order("rating_average", { ascending: false })
    .limit(remaining);

  return [...results, ...(crossCat ?? [])].map(transformRow);
}
