import { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { PageShell } from "@/components/portal/page-shell";
import { Panel } from "@/components/portal/panel";
import { ALL_TOOLS, DOWNLOADER_ITEMS, TOOL_GROUPS } from "@/lib/portal-nav";

const CANONICAL = "https://ssdown.app/tools";

/** dict.page_tools.categories 배열의 순서. 설명 문구를 hub 경로에 붙이는 데 쓴다. */
const DICT_CATEGORY_ORDER = [
  "/tools/image",
  "/tools/video-audio",
  "/tools/social-text",
  "/tools/utility",
  "/tools/pdf",
  "/tools/file",
];

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const title = dict.page_tools.meta_title;
  const description = dict.page_tools.meta_description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: CANONICAL,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: buildAlternates("/tools"),
  };
}

export default async function ToolsPage() {
  const dict = await getDictionary();

  const descByHub: Record<string, string> = {};
  DICT_CATEGORY_ORDER.forEach((hub, i) => {
    descByHub[hub] = dict.page_tools.categories[i]?.description ?? "";
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: CANONICAL },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: dict.tools.title,
    url: CANONICAL,
    numberOfItems: ALL_TOOLS.length,
    itemListElement: ALL_TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.label,
      url: `https://ssdown.app${t.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <PageShell
        crumbs={[{ label: dict.breadcrumb.tools }]}
        title={dict.tools.title}
        desc={dict.tools.subtitle}
        actions={
          <span className="text-[12px] text-[var(--pt-text-meta)]">
            총 <strong className="text-[var(--pt-accent)]">{ALL_TOOLS.length}</strong>개
          </span>
        }
      >
        {/* 카테고리 요약 */}
        <Panel title="카테고리" flush>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_GROUPS.map((g) => (
              <li
                key={g.key}
                className="min-w-0 border-b border-r border-[var(--pt-line)] last:border-r-0"
              >
                <Link href={g.hub} className="group block px-2.5 py-2">
                  <span className="flex items-center justify-between">
                    <span className="text-[13px] font-bold group-hover:text-[var(--pt-accent)]">
                      {g.label}
                    </span>
                    <span className="pt-badge">{g.items.length}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-[var(--pt-text-meta)]">
                    {descByHub[g.hub]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        {/* 카테고리별 전체 목록 */}
        {TOOL_GROUPS.map((g) => (
          <Panel
            key={g.key}
            title={`${g.label} (${g.items.length})`}
            href={g.hub}
            moreHref={g.hub}
          >
            <ul className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((it) => (
                <li key={it.href} className="border-b border-[var(--pt-line)]">
                  <Link href={it.href} className="pt-link block truncate py-[5px] text-[12px]">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        ))}

        <Panel title="영상 다운로드">
          <ul className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
            {DOWNLOADER_ITEMS.map((it) => (
              <li key={it.href} className="border-b border-[var(--pt-line)]">
                <Link href={it.href} className="pt-link block truncate py-[5px] text-[12px]">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </>
  );
}
