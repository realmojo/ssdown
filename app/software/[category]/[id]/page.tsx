import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Download,
  ShieldCheck,
  Star,
  ChevronRight,
  Globe,
  HardDrive,
  Tag,
  Calendar,
  Monitor,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { getAppById, getAlternatives } from "@/lib/app-utils";
import { getCategoryByMain, getCategoryBySlug } from "@/lib/categories";
import type { SoftwareApplication } from "@/types/app";
import Adsense from "@/components/Adsense";

const PLATFORM_AD_SLOT: Record<string, string> = {
  Windows: "6067594441",
  Mac:     "4754512774",
  Android: "5471730473",
  iOS:     "1235772885",
};

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}): Promise<Metadata> {
  const { category, id } = await params;
  const app = await getAppById(id);
  if (!app) return {};
  const canonical = `https://ssdown.app/software/${category}/${id}`;
  return {
    title: app.seo.title || `${app.core.name} 다운로드 - SSDown`,
    description: app.seo.description || app.content.shortSummary,
    alternates: { canonical },
    openGraph: {
      title: app.seo.title || `${app.core.name} 다운로드`,
      description: app.seo.description || app.content.shortSummary,
      url: canonical,
      images: app.content.iconUrl ? [{ url: app.content.iconUrl, width: 512, height: 512 }] : [],
    },
    twitter: {
      card: "summary",
      title: app.seo.title || `${app.core.name} 다운로드`,
      description: app.seo.description || app.content.shortSummary,
      images: app.content.iconUrl ? [app.content.iconUrl] : [],
    },
  };
}

const LICENSE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  Free:        { bg: "bg-emerald-500", text: "text-white", label: "무료" },
  Freemium:    { bg: "bg-teal-500",    text: "text-white", label: "부분 무료" },
  "Open Source":{ bg: "bg-blue-500",   text: "text-white", label: "오픈소스" },
  Trial:       { bg: "bg-amber-500",   text: "text-white", label: "체험판" },
  Paid:        { bg: "bg-rose-500",    text: "text-white", label: "유료" },
};

const SECURITY_STYLE: Record<string, { icon: string; color: string; label: string }> = {
  Safe:      { icon: "✓", color: "text-emerald-600", label: "안전" },
  Warning:   { icon: "!", color: "text-amber-600",   label: "주의" },
  Dangerous: { icon: "✗", color: "text-rose-600",    label: "위험" },
  Unknown:   { icon: "?", color: "text-gray-400",    label: "미확인" },
};

function RatingBar({ score, max = 5 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-6 text-right tabular-nums">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function FAQ({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, i) => (
        <details key={i} className="group py-4">
          <summary className="flex items-center justify-between cursor-pointer list-none gap-3">
            <span className="text-sm font-semibold text-gray-900 leading-snug">
              {item.question}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" />
          </summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category: categorySlug, id } = await params;
  const app = await getAppById(id);
  if (!app) notFound();
  const alternatives = await getAlternatives(app, 4);

  const category =
    getCategoryBySlug(categorySlug) ??
    getCategoryByMain(app.core.category.main);
  const canonicalUrl = `https://ssdown.app/software/${category?.slug ?? categorySlug}/${id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.core.name,
    description: app.content.shortSummary || app.seo.description,
    url: canonicalUrl,
    applicationCategory: app.core.category.main,
    operatingSystem: app.core.platform,
    ...(app.core.version && { softwareVersion: app.core.version }),
    ...(app.download.fileSize && { fileSize: app.download.fileSize }),
    ...(app.content.iconUrl && { image: app.content.iconUrl }),
    ...(app.specs.lastUpdatedDate && { dateModified: new Date(app.specs.lastUpdatedDate).toISOString() }),
    offers: {
      "@type": "Offer",
      price: app.download.license === "Free" || app.download.license === "Open Source" ? "0" : String(app.download.price ?? ""),
      priceCurrency: app.download.currency ?? "USD",
      availability: "https://schema.org/InStock",
    },
    ...(app.rating.average > 0 && app.rating.totalCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: app.rating.average.toFixed(1),
        ratingCount: app.rating.totalCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    author: {
      "@type": "Organization",
      name: app.core.developer.name || "Unknown",
      ...(app.core.developer.websiteUrl && { url: app.core.developer.websiteUrl }),
    },
    ...(app.content.screenshotUrls.length > 0 && {
      screenshot: app.content.screenshotUrls.slice(0, 5).map((src) => ({
        "@type": "ImageObject",
        url: src,
      })),
    }),
    ...(app.content.faq.length > 0 && {
      mainEntity: app.content.faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    }),
  };

  const licStyle = LICENSE_STYLE[app.download.license] ?? LICENSE_STYLE.Free;
  const secStyle = SECURITY_STYLE[app.download.security.status] ?? SECURITY_STYLE.Unknown;
  const hasScreenshots = app.content.screenshotUrls.length > 0;
  const hasPros = app.content.pros.length > 0;
  const hasCons = app.content.cons.length > 0;
  const hasFaq = app.content.faq.length > 0;
  const reviewHtml = app.content.aiReviewHtml || app.content.editorReviewHtml || app.content.bodyHtml;
  const adSlot = PLATFORM_AD_SLOT[app.core.platform] ?? "6067594441";

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="bg-slate-900 relative overflow-hidden">
        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-16 right-0 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          {/* breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-7">
            <a href="/" className="hover:text-slate-200 transition-colors">홈</a>
            <ChevronRight className="w-3 h-3" />
            <a href="/software" className="hover:text-slate-200 transition-colors">소프트웨어</a>
            {category && (
              <>
                <ChevronRight className="w-3 h-3" />
                <a href={`/software/${category.slug}`} className="hover:text-slate-200 transition-colors">
                  {category.name}
                </a>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-300">{app.core.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Icon */}
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-2xl bg-slate-800 flex items-center justify-center">
                {app.content.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={app.content.iconUrl}
                    alt={app.core.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-slate-400">
                    {app.core.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${licStyle.bg} ${licStyle.text}`}>
                  {licStyle.label}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {app.core.platform}
                </span>
                {app.core.version && (
                  <span className="text-xs text-slate-500">v{app.core.version}</span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none mb-2">
                {app.core.name}
              </h1>

              {app.core.developer.name && app.core.developer.name !== "Unknown" && (
                <p className="text-sm text-slate-400 mb-3">
                  by{" "}
                  {app.core.developer.websiteUrl ? (
                    <a
                      href={app.core.developer.websiteUrl}
                      target="_blank"
                      rel="nofollow noopener"
                      className="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-0.5"
                    >
                      {app.core.developer.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-300">{app.core.developer.name}</span>
                  )}
                </p>
              )}

              {app.content.shortSummary && (
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl mb-4">
                  {app.content.shortSummary}
                </p>
              )}

              {/* Rating row */}
              {app.rating.average > 0 && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(app.rating.average)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-amber-400 font-bold text-sm">
                    {app.rating.average.toFixed(1)}
                  </span>
                  {app.rating.totalCount > 0 && (
                    <span className="text-slate-500 text-xs">
                      ({app.rating.totalCount.toLocaleString()}개 리뷰)
                    </span>
                  )}
                </div>
              )}

              {/* Download CTA */}
              <a
                href={app.download.downloadUrl}
                target="_blank"
                rel="nofollow noopener"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-7 py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/40 text-sm"
              >
                <Download className="w-4 h-4" />
                무료 다운로드
              </a>
            </div>
          </div>
        </div>

        {/* ── STATS RAIL ───────────────────────────────────────────── */}
        <div className="border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto gap-0 divide-x divide-slate-800">
              {[
                { icon: HardDrive,    label: "파일 크기", value: app.download.fileSize || "—" },
                { icon: Tag,          label: "라이선스",  value: licStyle.label },
                { icon: Monitor,      label: "플랫폼",    value: app.core.platform },
                { icon: ShieldCheck,  label: "보안",      value: secStyle.label, color: secStyle.color },
                ...(app.download.downloadCount
                  ? [{ icon: Download, label: "다운로드", value: app.download.downloadCount }]
                  : []),
                ...(app.specs.lastUpdatedDate
                  ? [{ icon: Calendar, label: "최신 업데이트",
                       value: new Date(app.specs.lastUpdatedDate).toLocaleDateString("ko-KR", { year: "numeric", month: "short" }) }]
                  : []),
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-2.5 px-5 py-3.5 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
                    <div className={`text-xs font-semibold ${color ?? "text-slate-200"}`}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── AD 1: 헤더 하단 (stats rail 아래) ─────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Adsense slotId={adSlot} format="horizontal" />
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

          {/* ── LEFT COLUMN ──────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Screenshots */}
            {hasScreenshots && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  스크린샷
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {app.content.screenshotUrls.map((src, i) => (
                    <div
                      key={i}
                      className="shrink-0 snap-start w-72 h-44 rounded-xl overflow-hidden bg-gray-200 ring-1 ring-gray-200 shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`${app.core.name} 스크린샷 ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pros / Cons */}
            {(hasPros || hasCons) && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  장단점
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hasPros && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                        <span className="text-sm font-bold text-gray-900">장점</span>
                      </div>
                      <ul className="space-y-2">
                        {app.content.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span className="text-sm text-gray-700 leading-snug">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {hasCons && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                          <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                        </span>
                        <span className="text-sm font-bold text-gray-900">단점</span>
                      </div>
                      <ul className="space-y-2">
                        {app.content.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                            <span className="text-sm text-gray-700 leading-snug">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* AD 2: 리뷰 섹션 위 */}
            <div>
              <Adsense slotId={adSlot} format="rectangle" />
            </div>

            {/* Review / Body */}
            {reviewHtml && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  상세 리뷰
                </h2>
                <div
                  className="prose prose-sm prose-gray max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-li:text-gray-700 prose-a:text-blue-600"
                  dangerouslySetInnerHTML={{ __html: reviewHtml }}
                />
              </section>
            )}

            {/* FAQ */}
            {hasFaq && (
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  자주 묻는 질문
                </h2>
                <FAQ items={app.content.faq} />
              </section>
            )}
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Download card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <a
                href={app.download.downloadUrl}
                target="_blank"
                rel="nofollow noopener"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-sm mb-4"
              >
                <Download className="w-4 h-4" />
                다운로드
              </a>

              {/* Security badge */}
              <div className="flex items-center gap-2 justify-center text-xs mb-4">
                <ShieldCheck className={`w-3.5 h-3.5 ${secStyle.color}`} />
                <span className={`font-medium ${secStyle.color}`}>
                  바이러스 검사 완료 · {secStyle.label}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  ["버전",     app.core.version || "—"],
                  ["파일 크기", app.download.fileSize || "—"],
                  ["라이선스", licStyle.label],
                  ["플랫폼",   app.core.platform],
                  ...(app.specs.osRequirements ? [["OS 요구사항", app.specs.osRequirements]] : []),
                  ...(app.specs.languages?.length
                    ? [["지원 언어", app.specs.languages.slice(0, 3).join(", ")]]
                    : []),
                  ...(app.specs.lastUpdatedDate
                    ? [["업데이트", new Date(app.specs.lastUpdatedDate).toLocaleDateString("ko-KR")]]
                    : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-gray-400 shrink-0">{k}</span>
                    <span className="text-gray-700 font-medium text-right">{v}</span>
                  </div>
                ))}
              </div>

              {app.core.developer.websiteUrl && (
                <a
                  href={app.core.developer.websiteUrl}
                  target="_blank"
                  rel="nofollow noopener"
                  className="mt-4 flex items-center justify-center gap-1.5 w-full text-xs text-gray-500 hover:text-blue-600 transition-colors py-2 border border-gray-100 rounded-lg"
                >
                  <Globe className="w-3.5 h-3.5" />
                  공식 사이트 방문
                </a>
              )}
            </div>

            {/* AD 3: 우측 컬럼 중간 */}
            <Adsense slotId={adSlot} format="rectangle" />

            {/* Rating breakdown */}
            {app.rating.average > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  평점
                </h3>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-black text-gray-900 leading-none">
                    {app.rating.average.toFixed(1)}
                  </span>
                  <div className="pb-1">
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(app.rating.average)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {app.rating.totalCount > 0 && (
                      <p className="text-[11px] text-gray-400">
                        {app.rating.totalCount.toLocaleString()}개 리뷰
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <div key={n} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 w-3">{n}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: n === Math.round(app.rating.average) ? "60%" : n === Math.round(app.rating.average) - 1 ? "25%" : "8%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {app.rating.editorScore && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <div className="text-[11px] text-gray-400 mb-1.5">에디터 점수</div>
                    <RatingBar score={app.rating.editorScore} />
                  </div>
                )}
              </div>
            )}

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  대안 앱
                </h3>
                <div className="space-y-3">
                  {alternatives.map((alt) => {
                    const altCat = getCategoryByMain(alt.core.category.main);
                    return (
                      <a
                        key={alt.core.id}
                        href={`/software/${altCat?.slug ?? "utilities"}/${alt.core.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                          {alt.content.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={alt.content.iconUrl} alt={alt.core.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">{alt.core.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {alt.core.name}
                          </p>
                          {alt.rating.average > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span className="text-[11px] text-gray-400">{alt.rating.average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Back link */}
            {category && (
              <a
                href={`/software/${category.slug}`}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {category.name} 전체 보기
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
