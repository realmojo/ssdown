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
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { PageShell } from "@/components/portal/page-shell";
import { Panel } from "@/components/portal/panel";
import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import { jsonLd } from "@/lib/json-ld";

export const revalidate = 3600;

const OG_IMAGE = { url: "https://ssdown.app/logo.png", width: 1200, height: 630 };

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "카테고리별 무료 소프트웨어 다운로드 | SSDown",
  description:
    "카테고리별로 무료 소프트웨어를 찾아 내려받으세요. 윈도우, 맥, 안드로이드, iOS용 게임, 브라우저, 보안, 생산성, 유틸리티 등을 제공합니다.",
  keywords: "무료 소프트웨어 다운로드, 소프트웨어 카테고리, 무료 앱 추천, 윈도우 프로그램, 맥 프로그램, 안드로이드 앱",
  robots: { index: true, follow: true },
  alternates: buildAlternates("/software"),
  openGraph: {
    title: "카테고리별 무료 소프트웨어 다운로드 | SSDown",
    description: "카테고리별로 무료 소프트웨어를 찾아 내려받으세요. 게임, 브라우저, 보안, 생산성, 유틸리티 등을 제공합니다.",
    url: "https://ssdown.app/software",
    siteName: "SSDown",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "카테고리별 무료 소프트웨어 다운로드 | SSDown",
    description: "카테고리별로 무료 소프트웨어를 찾아 내려받으세요. 게임, 브라우저, 보안, 생산성, 유틸리티 등을 제공합니다.",
    images: [OG_IMAGE.url],
  },
  };
}

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

function CategoryIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className="h-3.5 w-3.5" />;
}

export default function SoftwareCategoriesPage() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
        { "@type": "ListItem", position: 2, name: "Software", item: "https://ssdown.app/software" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Free Software Downloads by Category",
      description: "카테고리별로 무료 소프트웨어를 찾아 내려받으세요. 윈도우, 맥, 안드로이드, iOS용 게임, 브라우저, 보안, 생산성, 유틸리티 등을 제공합니다.",
      url: "https://ssdown.app/software",
      publisher: {
        "@type": "Organization",
        name: "SSDown",
        url: "https://ssdown.app",
      },
      hasPart: CATEGORIES.map((cat) => ({
        "@type": "WebPage",
        name: `${cat.name} Software`,
        url: `https://ssdown.app/software/${cat.slug}`,
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
      <PageShell
        crumbs={[{ label: "소프트웨어" }]}
        title="무료 소프트웨어 모음"
        desc="카테고리나 플랫폼별로 평점 높은 무료 소프트웨어와 앱을 둘러보세요."
      >
        <Panel title="플랫폼별로 찾기">
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            {[
              { slug: "windows", label: "Windows", desc: "PC·데스크톱" },
              { slug: "mac", label: "Mac", desc: "macOS 앱" },
              { slug: "android", label: "안드로이드", desc: "안드로이드 앱" },
              { slug: "iphone", label: "iPhone", desc: "iOS 앱" },
              { slug: "linux", label: "Linux", desc: "리눅스 앱" },
            ].map(({ slug, label, desc }) => (
              <li key={slug}>
                <a
                  href={`/software/${slug}`}
                  className="block border border-[var(--pt-line)] px-2 py-2 text-center hover:border-[var(--pt-accent)]"
                >
                  <span className="block text-[13px] font-bold hover:text-[var(--pt-accent)]">
                    {label}
                  </span>
                  <span className="block text-[11px] text-[var(--pt-text-meta)]">{desc}</span>
                </a>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="카테고리별로 찾기" flush>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <li
                key={category.slug}
                className="min-w-0 border-b border-r border-[var(--pt-line)]"
              >
                <a
                  href={`/software/${category.slug}`}
                  className="group flex items-center gap-1.5 px-2.5 py-[7px]"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--pt-text-meta)]">
                    <CategoryIcon name={category.icon} />
                  </span>
                  <span className="flex-1 truncate text-[12px] group-hover:text-[var(--pt-accent)] group-hover:underline">
                    {category.name}
                  </span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-[var(--pt-text-meta)]" />
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </>
  );
}
