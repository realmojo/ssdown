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
import { getCategoryBySlug, CATEGORIES } from "@/lib/categories";
import { getAppsByCategory, getAppsByPlatform } from "@/lib/app-utils";
import type { SoftwareApplication } from "@/types/app";

const PLATFORMS = ["windows", "mac", "android", "iphone"] as const;
type PlatformSlug = (typeof PLATFORMS)[number];
const PLATFORM_LABELS: Record<PlatformSlug, string> = {
  windows: "Windows",
  mac: "Mac",
  android: "Android",
  iphone: "iOS",
};

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;

  if (PLATFORMS.includes(slug as PlatformSlug)) {
    const label = PLATFORM_LABELS[slug as PlatformSlug];
    const title = `Best Free ${label} Software & Apps Download - ${SITE_NAME}`;
    const description = `Download the best free ${label} software and apps. Browse top-rated ${label} applications for productivity, games, security, and more.`;
    const canonical = `${SITE_URL}/software/${slug}`;
    return {
      title,
      description,
      keywords: `${label} software download, free ${label} apps, best ${label} programs, ${label} applications`,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: SITE_NAME,
        type: "website",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const title = `Best Free ${category.name} Software & Apps - ${SITE_NAME}`;
  const description = `Download the best free ${category.name} software and apps. Find top-rated ${category.name} applications for Windows, Mac, Android, and iOS.`;
  const canonical = `${SITE_URL}/software/${slug}`;

  return {
    title,
    description,
    keywords: `${category.name} software download, free ${category.name} apps, best ${category.name} programs`,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
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
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`f-${i}`}
          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
        />
      ))}
      {hasHalf && (
        <Star className="w-3.5 h-3.5 fill-amber-200 text-amber-400" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="w-3.5 h-3.5 text-gray-300" />
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
}

function buildAppHref(app: SoftwareApplication): string {
  const platform =
    app.core.platform.toLowerCase() === "ios"
      ? "iphone"
      : app.core.platform.toLowerCase();
  const id = app.core.id.toLowerCase();
  const prefixPattern = new RegExp(`^${platform}-?`);
  const slug = id.replace(prefixPattern, "") || id;
  return `/software/${platform}/${slug}`;
}

function AppGrid({ apps }: { apps: SoftwareApplication[] }) {
  if (apps.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No apps found</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {apps.map((app) => (
        <a
          key={app.core.id}
          href={buildAppHref(app)}
          className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              {app.content.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={app.content.iconUrl}
                  alt={app.core.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-gray-400">
                  {app.core.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                {app.core.name}
              </h2>
              {app.core.developer.name && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {app.core.developer.name}
                </p>
              )}
              {app.rating.average > 0 && (
                <div className="mt-1.5">
                  <RatingStars rating={app.rating.average} />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                  {app.download.license}
                </span>
                <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {app.core.platform}
                </span>
              </div>
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
      name: `Best ${label} Software`,
      url: pageUrl,
      numberOfItems: apps.length,
      itemListElement: apps.slice(0, 10).map((app, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: app.core.name,
        url: `${SITE_URL}/software/${app.core.platform.toLowerCase() === "ios" ? "iphone" : app.core.platform.toLowerCase()}/${app.core.id.toLowerCase()}`,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: slug } = await params;
  const { category: categoryFilter } = await searchParams;

  // 플랫폼 slug 처리 (windows / mac / android / iphone)
  const isPlatform = PLATFORMS.includes(slug as PlatformSlug);
  if (isPlatform) {
    const label = PLATFORM_LABELS[slug as PlatformSlug];
    const { apps, total } = await getAppsByPlatform(slug, 60, 0, categoryFilter);

    return (
      <div className="min-h-screen bg-gray-50">
        <CategoryJsonLd label={label} slug={slug} apps={apps} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {label} Software
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {total > 0 ? `${total} apps` : ""}
              </p>
            </div>
          </div>

          {/* 카테고리 필터 탭 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <a
              href={`/software/${slug}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !categoryFilter
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
              }`}
            >
              All
            </a>
            {PLATFORM_CATEGORIES.map((category_main) => {
              const isActive = categoryFilter === category_main;
              return (
                <a
                  key={category_main}
                  href={`/software/${slug}?category=${encodeURIComponent(category_main)}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {category_main}
                </a>
              );
            })}
          </div>

          <AppGrid apps={apps} />
        </div>
      </div>
    );
  }

  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const { apps, total } = await getAppsByCategory(slug, 60);

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryJsonLd label={category.name} slug={slug} apps={apps} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
            <CategoryIcon
              name={category.icon}
              className="w-8 h-8 text-blue-600"
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {category.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total > 0 ? `${total} apps` : ""}
            </p>
          </div>
        </div>

        {/* App Grid */}
        <AppGrid apps={apps} />
      </div>
    </div>
  );
}
