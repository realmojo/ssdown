import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Gamepad2,
  Globe,
  ShieldCheck,
  Lightbulb,
  Wifi,
  Play,
  Monitor,
  Pencil,
  GraduationCap,
  Coffee,
  Users,
  Plane,
  Wrench,
  BrainCircuit,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCategoryBySlug, getCategoryByMain, CATEGORIES } from "@/lib/categories";
import { getAppsByCategory, getAppsByPlatform, localizeApp } from "@/lib/app-utils";
import type { SoftwareApplication } from "@/types/app";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

const PLATFORMS = ["windows", "mac", "android", "iphone"] as const;
type PlatformSlug = (typeof PLATFORMS)[number];
const PLATFORM_LABELS: Record<PlatformSlug, string> = {
  windows: "Windows",
  mac: "Mac",
  android: "Android",
  iphone: "iOS",
};

const LICENSE_KR: Record<string, string> = {
  Free: "무료",
  Freemium: "부분 무료",
  "Open Source": "오픈소스",
  Trial: "체험판",
  Paid: "유료",
};

/**
 * 스크래핑 과정에서 들어온 가짜 개발자명("Unknown", "More programs (12)")을 걸러낸다.
 * 실제 개발자 정보가 아니므로 화면에 노출하지 않는다.
 */
function isRealDeveloper(name?: string): boolean {
  if (!name) return false;
  const t = name.trim();
  if (!t || t === "Unknown") return false;
  return !/^More programs\s*\(\d+\)$/.test(t);
}

// DB에서 확인된 category_main 값 (내림차순)
const PLATFORM_CATEGORIES: string[] = [
  "Games",
  "Multimedia",
  "Productivity",
  "Utilities & Tools",
  "Personalization",
  "Development & IT",
  "Security & Privacy",
  "Education & Reference",
  "Lifestyle",
  "Social & Communication",
  "Browsers",
  "Internet & Network",
  "Travel & Navigation",
  "AI",
];

export const revalidate = 3600;

const ICON_MAP: Record<string, LucideIcon> = {
  Gamepad2,
  Globe,
  ShieldCheck,
  Lightbulb,
  Wifi,
  Play,
  Monitor,
  Pencil,
  GraduationCap,
  Coffee,
  Users,
  Plane,
  Wrench,
  BrainCircuit,
};

export async function generateStaticParams() {
  return [
    ...CATEGORIES.map((c) => ({ category: c.slug })),
    ...PLATFORMS.map((p) => ({ category: p })),
  ];
}

const SITE_URL = "https://ssdown.app";
const SITE_NAME = "SSDown";

const OG_IMAGE = { url: "https://ssdown.app/logo.png", width: 1200, height: 630 };

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  if (PLATFORMS.includes(slug as PlatformSlug)) {
    const label = PLATFORM_LABELS[slug as PlatformSlug];
    const title = `${label} 무료 소프트웨어·앱 추천 | ${SITE_NAME}`;
    const description = `${label}용 무료 소프트웨어와 앱을 내려받으세요. 생산성, 게임, 보안 등 평점 높은 ${label} 프로그램을 둘러볼 수 있습니다.`;
    const canonical = `${SITE_URL}/software/${slug}`;
    return {
      title,
      description,
      keywords: `${label} software download, free ${label} apps, best ${label} programs, ${label} applications`,
      robots: { index: true, follow: true },
      alternates: {
        canonical: page > 1 ? `${SITE_URL}/software/${slug}?page=${page}` : `${SITE_URL}/software/${slug}`,
        ...(page > 1 && { prev: page === 2 ? `${SITE_URL}/software/${slug}` : `${SITE_URL}/software/${slug}?page=${page - 1}` }),
      },
      openGraph: { title, description, url: canonical, siteName: SITE_NAME, type: "website", images: [OG_IMAGE] },
      twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
    };
  }

  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const title = `${category.name} 무료 소프트웨어·앱 추천 | ${SITE_NAME}`;
  const description = `${category.name} 무료 소프트웨어와 앱을 내려받으세요. 윈도우, 맥, 안드로이드, iOS용 평점 높은 ${category.name} 프로그램을 찾아보세요.`;
  const canonical = `${SITE_URL}/software/${slug}`;

  return {
    title,
    description,
    keywords: `${category.name} software download, free ${category.name} apps, best ${category.name} programs`,
    robots: { index: true, follow: true },
    alternates: {
      canonical: page > 1 ? `${SITE_URL}/software/${slug}?page=${page}` : `${SITE_URL}/software/${slug}`,
      ...(page > 1 && { prev: page === 2 ? `${SITE_URL}/software/${slug}` : `${SITE_URL}/software/${slug}?page=${page - 1}` }),
    },
    openGraph: { title, description, url: canonical, siteName: SITE_NAME, type: "website", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}

function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-[1px]">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
      ))}
      {hasHalf && <Star className="h-2.5 w-2.5 fill-amber-200 text-amber-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-2.5 w-2.5 text-gray-300" />
      ))}
      <span className="ml-0.5 text-[11px] text-[var(--pt-text-meta)]">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function buildAppHref(app: SoftwareApplication): string {
  if (app.core.slug) return `/software${app.core.slug}`;
  const platform =
    app.core.platform.toLowerCase() === "ios"
      ? "iphone"
      : app.core.platform.toLowerCase();
  return `/software/${platform}/${app.core.id.toLowerCase()}`;
}

function AppGrid({ apps }: { apps: SoftwareApplication[] }) {
  if (apps.length === 0) {
    return (
      <div className="pt-panel py-10 text-center text-[12px] text-[var(--pt-text-meta)]">
        앱을 찾지 못했습니다.
      </div>
    );
  }
  return (
    <div className="pt-panel grid sm:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <a
          key={app.core.id}
          href={buildAppHref(app)}
          className="group flex items-start gap-2 border-b border-r border-[var(--pt-line)] px-2 py-2 hover:bg-[var(--pt-hover)]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-[var(--pt-line)] bg-white">
            {app.content.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={app.content.iconUrl}
                alt={app.core.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-[15px] font-bold text-[var(--pt-text-meta)]">
                {app.core.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[12px] font-semibold group-hover:text-[var(--pt-accent)] group-hover:underline">
              {app.core.name}
            </h2>
            {isRealDeveloper(app.core.developer.name) && (
              <p className="truncate text-[11px] text-[var(--pt-text-meta)]">
                {app.core.developer.name}
              </p>
            )}
            <div className="mt-0.5 flex flex-wrap items-center gap-1">
              <span className="pt-badge">
                {LICENSE_KR[app.download.license] ?? app.download.license}
              </span>
              <span className="pt-badge">{app.core.platform}</span>
              {app.rating.average > 0 && <RatingStars rating={app.rating.average} />}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function CategoryJsonLd({
  label,
  slug,
  apps,
}: {
  label: string;
  slug: string;
  apps: SoftwareApplication[];
}) {
  const pageUrl = `${SITE_URL}/software/${slug}`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Software",
          item: `${SITE_URL}/software`,
        },
        { "@type": "ListItem", position: 3, name: label, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${label} 인기 소프트웨어`,
      url: pageUrl,
      numberOfItems: apps.length,
      itemListElement: apps.slice(0, 10).map((app, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: app.core.name,
        url: `${SITE_URL}/software${app.core.slug || `/${app.core.platform.toLowerCase() === "ios" ? "iphone" : app.core.platform.toLowerCase()}/${app.core.id.toLowerCase()}`}`,
        ...(app.content.iconUrl && { image: app.content.iconUrl }),
      })),
    },
  ];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      ))}
    </>
  );
}

const PAGE_SIZE = 18;

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

function Pagination({
  currentPage,
  totalPages,
  buildPageUrl,
}: {
  currentPage: number;
  totalPages: number;
  buildPageUrl: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const delta = 2;
  const pages: (number | "...")[] = [];
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i);
    } else if (i === left - 1 || i === right + 1) {
      pages.push("...");
    }
  }

  const btnBase =
    "inline-flex h-7 min-w-7 items-center justify-center border px-2 text-[12px]";
  const activeBtn = `${btnBase} border-[var(--pt-accent)] bg-[var(--pt-accent)] font-bold text-white`;
  const inactiveBtn = `${btnBase} border-[var(--pt-line)] bg-white text-[var(--pt-text-sub)] hover:border-[var(--pt-accent)] hover:text-[var(--pt-accent)]`;
  const disabledBtn = `${btnBase} pointer-events-none border-[var(--pt-line)] bg-white text-[var(--pt-text-meta)] opacity-50`;

  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
      {currentPage > 1 ? (
        <a href={buildPageUrl(currentPage - 1)} className={inactiveBtn}>← 이전</a>
      ) : (
        <span className={disabledBtn}>← 이전</span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
        ) : (
          <a
            key={p}
            href={buildPageUrl(p)}
            className={p === currentPage ? activeBtn : inactiveBtn}
          >
            {p}
          </a>
        )
      )}

      {currentPage < totalPages ? (
        <a href={buildPageUrl(currentPage + 1)} className={inactiveBtn}>다음 →</a>
      ) : (
        <span className={disabledBtn}>다음 →</span>
      )}
    </div>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category: slug } = await params;
  const { category: categoryFilter, page: pageParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  // 플랫폼 slug 처리 (windows / mac / android / iphone)
  const isPlatform = PLATFORMS.includes(slug as PlatformSlug);
  if (isPlatform) {
    const label = PLATFORM_LABELS[slug as PlatformSlug];
    const { apps: rawApps, total } = await getAppsByPlatform(slug, PAGE_SIZE, offset, categoryFilter);
    const apps = rawApps.map((a) => localizeApp(a));
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const buildPageUrl = (page: number) =>
      buildUrl(`/software/${slug}`, {
        category: categoryFilter,
        page: page > 1 ? String(page) : undefined,
      });

    return (
      <>
        <CategoryJsonLd label={label} slug={slug} apps={apps} />
        <PageShell
          crumbs={[{ label: "소프트웨어", href: "/software" }, { label }]}
          title={`${label} 소프트웨어`}
          desc={`${label}에서 쓸 수 있는 무료 프로그램과 앱을 평점순으로 모았습니다.`}
          actions={
            total > 0 ? (
              <span className="text-[12px] text-[var(--pt-text-meta)]">
                총 <strong className="text-[var(--pt-accent)]">{total.toLocaleString()}</strong>개
              </span>
            ) : undefined
          }
        >
          {/* 카테고리 필터 탭 */}
          <nav className="flex flex-wrap items-center gap-x-1 border-b border-[var(--pt-line)] pb-2">
            <a
              href={`/software/${slug}`}
              className={`px-2 py-1 text-[12px] ${
                !categoryFilter
                  ? "font-bold text-[var(--pt-accent)]"
                  : "text-[var(--pt-text-sub)] hover:text-[var(--pt-accent)]"
              }`}
            >
              전체
            </a>
            {PLATFORM_CATEGORIES.map((category_main) => {
              const isActive = categoryFilter === category_main;
              return (
                <a
                  key={category_main}
                  href={`/software/${slug}?category=${encodeURIComponent(category_main)}`}
                  className={`px-2 py-1 text-[12px] ${
                    isActive
                      ? "font-bold text-[var(--pt-accent)]"
                      : "text-[var(--pt-text-sub)] hover:text-[var(--pt-accent)]"
                  }`}
                >
                  {getCategoryByMain(category_main)?.name ?? category_main}
                </a>
              );
            })}
          </nav>

          <AppGrid apps={apps} />
          <Pagination currentPage={currentPage} totalPages={totalPages} buildPageUrl={buildPageUrl} />
        </PageShell>
      </>
    );
  }

  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const { apps: rawApps, total } = await getAppsByCategory(slug, PAGE_SIZE, offset);
  const apps = rawApps.map((a) => localizeApp(a));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildPageUrl = (page: number) =>
    buildUrl(`/software/${slug}`, { page: page > 1 ? String(page) : undefined });

  return (
    <>
      <CategoryJsonLd label={category.name} slug={slug} apps={apps} />
      <PageShell
        crumbs={[{ label: "소프트웨어", href: "/software" }, { label: category.name }]}
        title={category.name}
        desc={`${category.name} 분야에서 평점이 높은 무료 프로그램과 앱을 모았습니다.`}
        actions={
          total > 0 ? (
            <span className="text-[12px] text-[var(--pt-text-meta)]">
              총 <strong className="text-[var(--pt-accent)]">{total.toLocaleString()}</strong>개
            </span>
          ) : undefined
        }
      >
        <AppGrid apps={apps} />
        <Pagination currentPage={currentPage} totalPages={totalPages} buildPageUrl={buildPageUrl} />
      </PageShell>
    </>
  );
}
