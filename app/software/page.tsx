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
import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";

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
  return <Icon className="w-7 h-7 text-blue-600" />;
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
    <div className="min-h-screen bg-gray-50">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <a href="/" className="hover:text-gray-600 transition-colors">홈</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">소프트웨어</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          무료 소프트웨어 다운로드
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          카테고리나 플랫폼별로 평점 높은 무료 소프트웨어와 앱을 둘러보세요.
        </p>

        {/* Browse by Platform */}
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">플랫폼별로 찾기</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { slug: "windows", label: "Windows", desc: "PC·데스크톱" },
            { slug: "mac",     label: "Mac",     desc: "macOS 앱" },
            { slug: "android", label: "Android", desc: "안드로이드 앱" },
            { slug: "iphone",  label: "iPhone",  desc: "iOS 앱" },
          ].map(({ slug, label, desc }) => (
            <a
              key={slug}
              href={`/software/${slug}`}
              className="group flex flex-col items-center justify-center gap-1 bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all text-center"
            >
              <span className="text-2xl">{slug === "windows" ? "🖥️" : slug === "mac" ? "🍎" : slug === "android" ? "🤖" : "📱"}</span>
              <span className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{label}</span>
              <span className="text-[11px] text-gray-400">{desc}</span>
            </a>
          ))}
        </div>

        {/* Browse by Category */}
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">카테고리별로 찾기</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => (
            <a
              key={category.slug}
              href={`/software/${category.slug}`}
              className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <CategoryIcon name={category.icon} />
              </div>
              <span className="flex-1 font-medium text-gray-800 text-sm">
                {category.name}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
