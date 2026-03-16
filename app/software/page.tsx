import Link from "next/link";
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
  title: "소프트웨어 카테고리 - SSDown",
  description:
    "게임, 브라우저, 보안, 생산성 등 다양한 카테고리의 소프트웨어를 찾아보세요.",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Software", item: "https://ssdown.app/software" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          소프트웨어 카테고리
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => (
            <Link
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
