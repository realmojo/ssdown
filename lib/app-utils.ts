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

export async function getApp(
  os: string,
  name: string
): Promise<SoftwareApplication | null> {
  const platform = os.charAt(0).toUpperCase() + os.slice(1).toLowerCase();

  const { data, error } = await supabase
    .from("software_applications")
    .select("*")
    .eq("platform", platform)
    .ilike("id", `%${name.toLowerCase()}%`)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return transformRow(data);
}

export async function getAppsByCategory(
  categorySlug: string,
  limit = 20,
  offset = 0
): Promise<{ apps: SoftwareApplication[]; total: number }> {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { apps: [], total: 0 };

  // Build ilike filters for all aliases
  const orFilter = category.aliases
    .map((alias) => `category_main.ilike.%${alias}%`)
    .join(",");

  const { count, error: countError } = await supabase
    .from("software_applications")
    .select("id", { count: "exact", head: true })
    .or(orFilter);

  if (countError) return { apps: [], total: 0 };

  const { data, error } = await supabase
    .from("software_applications")
    .select("*")
    .or(orFilter)
    .order("rating_average", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return { apps: [], total: count ?? 0 };

  return {
    apps: data.map(transformRow),
    total: count ?? data.length,
  };
}
