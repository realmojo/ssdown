import { supabase } from "./supabase";
import { SoftwareApplication, PlatformType, LicenseType, SecurityStatus, FaqItem } from "@/types/app";
import { getCategoryBySlug } from "./categories";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformRow(row: any): SoftwareApplication {
  const faq: FaqItem[] = Array.isArray(row.faq)
    ? row.faq.filter((f: FaqItem) => f.question && f.answer)
    : [];

  return {
    core: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      version: row.version ?? "",
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
      keywords: row.seo_keywords ?? [],
      ogImage: row.seo_og_image ?? "",
      structuredData: row.seo_structured_data ?? {},
    },
    download: {
      downloadUrl: row.download_url ?? "#",
      fileSize: row.file_size ?? "",
      downloadCount: row.download_count ?? undefined,
      license: (row.license ?? "Free") as LicenseType,
      price: row.price ?? undefined,
      currency: row.currency ?? undefined,
      security: {
        status: (row.security_status ?? "Unknown") as SecurityStatus,
        lastScannedAt: row.security_last_scanned_at ?? new Date().toISOString(),
        scanProvider: row.security_scan_provider ?? undefined,
      },
    },
    rating: {
      average: row.rating_average ?? 0,
      totalCount: row.rating_total_count ?? 0,
      editorScore: row.rating_editor_score ?? undefined,
    },
    content: {
      iconUrl: row.icon_url ?? "",
      screenshotUrls: row.screenshot_urls ?? [],
      videoUrl: row.video_url ?? undefined,
      shortSummary: row.short_summary ?? "",
      bodyHtml: row.body_html ?? "",
      editorReviewHtml: row.editor_review_html ?? "",
      aiReviewHtml: row.ai_review_html ?? "",
      pros: row.pros ?? [],
      cons: row.cons ?? [],
      features: row.features ?? [],
      faq,
    },
    specs: {
      osRequirements: row.os_requirements ?? "",
      languages: row.languages ?? [],
      lastUpdatedDate: row.last_updated_date ?? new Date().toISOString(),
    },
    relations: {
      alternativesAppIds: [],
      relatedArticlesIds: row.related_article_ids ?? [],
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

const CARD_COLUMNS = "id,slug,name,platform,category_main,license,rating_average,rating_total_count,icon_url,short_summary,developer_name,download_url";

export async function getAppsByPlatform(
  platform: string,
  limit = 60,
  offset = 0
): Promise<{ apps: SoftwareApplication[]; total: number }> {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  const platformMap: Record<string, string> = { iphone: 'iOS', ios: 'iOS' };
  const normalized = platformMap[platform.toLowerCase()] ?? platformName;

  const [{ count, error: countError }, { data, error }] = await Promise.all([
    supabase.from("software_applications").select("id", { count: "exact", head: true }).eq("platform", normalized),
    supabase.from("software_applications").select(CARD_COLUMNS).eq("platform", normalized).order("rating_average", { ascending: false }).range(offset, offset + limit - 1),
  ]);

  if (countError || error || !data) return { apps: [], total: 0 };
  return { apps: data.map(transformRow), total: count ?? data.length };
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
    supabase.from("software_applications").select("id", { count: "exact", head: true }).or(orFilter),
    supabase.from("software_applications").select(CARD_COLUMNS).or(orFilter).order("rating_average", { ascending: false }).range(offset, offset + limit - 1),
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
  limit = 5
): Promise<SoftwareApplication[]> {
  const CARD_COLUMNS = "id,slug,name,platform,category_main,license,rating_average,rating_total_count,icon_url,short_summary,developer_name,download_url";
  const { data, error } = await supabase
    .from("software_applications")
    .select(CARD_COLUMNS)
    .eq("category_main", app.core.category.main)
    .eq("platform", app.core.platform)
    .neq("id", app.core.id)
    .order("rating_average", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(transformRow);
}
