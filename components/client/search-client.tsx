"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Star, Search, SlidersHorizontal } from "lucide-react";
import type { SoftwareApplication } from "@/types/app";
import { CATEGORIES } from "@/lib/categories";
import { buildAppHref } from "@/lib/app-href";

const OS_OPTIONS = [
  { value: "", label: "전체 플랫폼" },
  { value: "windows", label: "Windows" },
  { value: "mac", label: "Mac" },
  { value: "android", label: "Android" },
  { value: "iphone", label: "iOS" },
];

const LICENSE_OPTIONS = [
  { value: "", label: "전체 라이선스" },
  { value: "Free", label: "Free" },
  { value: "Freemium", label: "Freemium" },
  { value: "Paid", label: "Paid" },
  { value: "Open Source", label: "오픈소스" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "전체 카테고리" },
  ...CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
];

const PAGE_SIZE = 24;

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
      {hasHalf && <Star className="w-3.5 h-3.5 fill-amber-200 text-amber-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="w-3.5 h-3.5 text-gray-300" />
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
}

function AppCard({ app }: { app: SoftwareApplication }) {
  return (
    <a
      href={buildAppHref(app)}
      className="pt-panel group p-2 hover:border-[var(--pt-accent)]"
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
          {app.content.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={app.content.iconUrl} alt={app.core.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-gray-400">{app.core.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
            {app.core.name} 다운로드
          </h2>
          {app.core.developer.name && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{app.core.developer.name}</p>
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
            {app.core.category.main && (
              <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                {app.core.category.main}
              </span>
            )}
          </div>
        </div>
      </div>
      {app.content.shortSummary && (
        <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
          {app.content.shortSummary}
        </p>
      )}
    </a>
  );
}

interface Props {
  initialApps: SoftwareApplication[];
  initialTotal: number;
  initialOs: string;
  initialLicense: string;
  initialCategory: string;
  initialQ: string;
  initialPage: number;
}

export default function SearchClient({
  initialApps,
  initialTotal,
  initialOs,
  initialLicense,
  initialCategory,
  initialQ,
  initialPage,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      // filter 바뀌면 page 리셋
      if (!("page" in updates)) params.delete("page");
      startTransition(() => router.push(`/search?${params.toString()}`));
    },
    [router, searchParams]
  );

  const totalPages = Math.ceil(initialTotal / PAGE_SIZE);

  return (
    <div className="">
      <div className="pt-wrap py-2">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-blue-600" />
            소프트웨어 검색
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {initialTotal.toLocaleString()}개의 앱을 찾았습니다
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-2 flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="앱 검색…"
              defaultValue={initialQ}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pushParams({ q: (e.target as HTMLInputElement).value });
                }
              }}
              onBlur={(e) => {
                if (e.target.value !== initialQ) {
                  pushParams({ q: e.target.value });
                }
              }}
            />
          </div>

          {/* OS */}
          <select
            value={initialOs}
            onChange={(e) => pushParams({ os: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {OS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* License */}
          <select
            value={initialLicense}
            onChange={(e) => pushParams({ license: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {LICENSE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={initialCategory}
            onChange={(e) => pushParams({ category: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className={isPending ? "opacity-50 pointer-events-none transition-opacity" : ""}>
          {initialApps.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg">앱을 찾지 못했습니다</p>
              <p className="text-sm mt-1">필터를 조정해 보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialApps.map((app) => (
                <AppCard key={app.core.id} app={app} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {initialPage > 1 && (
                <button
                  onClick={() => pushParams({ page: String(initialPage - 1) })}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              <span className="text-sm text-gray-500">
                Page {initialPage} of {totalPages}
              </span>
              {initialPage < totalPages && (
                <button
                  onClick={() => pushParams({ page: String(initialPage + 1) })}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm bg-white hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
