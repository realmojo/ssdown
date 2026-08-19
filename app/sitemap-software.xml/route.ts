import { CATEGORIES, getCategoryByMain } from "@/lib/categories";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

const BASE = "https://ssdown.app";

type Entry = { path: string; lastmod: string; changefreq: string; priority: number };

function buildXml(entries: Entry[]): string {
  // Korean-only site: a single root URL per path, no hreflang alternates.
  const rows = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${BASE}${e.path}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>`;
}

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const categoryEntries: Entry[] = [
    { path: `/software`, lastmod: "2026-03-17", changefreq: "daily",   priority: 0.9 },
    ...CATEGORIES.map((cat) => ({
      path: `/software/${cat.slug}`,
      lastmod: "2026-03-17",
      changefreq: "weekly",
      priority: 0.7,
    })),
    ...["windows", "mac", "android", "iphone"].map((platform) => ({
      path: `/software/${platform}`,
      lastmod: "2026-03-17",
      changefreq: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const BATCH = 1000;
  const allApps: { id: string; slug: string; category_main: string; last_updated_date: string }[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("ssdown_software_applications")
      .select("id, slug, category_main, last_updated_date")
      .order("last_updated_date", { ascending: false })
      .range(from, from + BATCH - 1);

    if (error || !data || data.length === 0) break;
    allApps.push(...data);
    if (data.length < BATCH) break;
    from += BATCH;
  }

  const apps = allApps;

  const appEntries: Entry[] = (apps ?? [])
    .map((app) => {
      const cat = getCategoryByMain(app.category_main ?? "");
      const slugPath = app.slug || (cat ? `/${cat.slug}/${app.id}` : null);
      if (!slugPath) return null;
      return {
        path: `/software${slugPath}`,
        lastmod: app.last_updated_date
          ? new Date(app.last_updated_date).toISOString().split("T")[0]
          : today,
        changefreq: "monthly",
        priority: 0.6,
      };
    })
    .filter((e): e is Entry => e !== null);

  return new Response(buildXml([...categoryEntries, ...appEntries]), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
