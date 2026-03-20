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

export const revalidate = 3600;

export const metadata = {
  title: "Free Software Downloads by Category - SSDown",
  description:
    "Browse and download free software by category — games, browsers, security, productivity, utilities, and more for Windows, Mac, Android, and iOS.",
  keywords: "free software download, software categories, best free apps, windows software, mac software, android apps",
  alternates: { canonical: "https://ssdown.app/software" },
  openGraph: {
    title: "Free Software Downloads by Category - SSDown",
    description: "Browse and download free software by category — games, browsers, security, productivity, utilities, and more.",
    url: "https://ssdown.app/software",
    siteName: "SSDown",
    type: "website",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Free Software Downloads by Category - SSDown",
    description: "Browse and download free software by category — games, browsers, security, productivity, utilities, and more.",
  },
};

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
      description: "Browse and download free software by category — games, browsers, security, productivity, utilities, and more for Windows, Mac, Android, and iOS.",
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          소프트웨어 카테고리
        </h1>

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
