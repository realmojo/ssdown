import { notFound } from "next/navigation";
import Link from "next/link";
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
import { getAppsByCategory } from "@/lib/app-utils";
import type { SoftwareApplication } from "@/types/app";

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
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: `${category.name} 소프트웨어 - SSDown`,
    description: `${category.name} 카테고리의 소프트웨어를 다운로드하세요.`,
  };
}

function CategoryIcon({ name, className }: { name: string; className?: string }) {
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
        <Star key={`f-${i}`} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
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
  const platform = app.core.platform.toLowerCase();
  // Remove platform prefix from id to create the slug
  // e.g., "windows-google-chrome" → "google-chrome"
  const id = app.core.id.toLowerCase();
  const prefixPattern = new RegExp(`^${platform}-?`);
  const slug = id.replace(prefixPattern, "") || id;
  return `/${platform}/${slug}`;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) notFound();

  const { apps, total } = await getAppsByCategory(slug, 60);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
            <CategoryIcon name={category.icon} className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {category.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total > 0 ? `${total}개의 앱` : ""}
            </p>
          </div>
        </div>

        {/* App Grid */}
        {apps.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">아직 등록된 앱이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <Link
                key={app.core.id}
                href={buildAppHref(app)}
                className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* App Icon */}
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

                  {/* App Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                      {app.core.name}
                    </h2>
                    {app.core.developer.name && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {app.core.developer.name}
                      </p>
                    )}

                    {/* Rating */}
                    {app.rating.average > 0 && (
                      <div className="mt-1.5">
                        <RatingStars rating={app.rating.average} />
                      </div>
                    )}

                    {/* Badges */}
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
