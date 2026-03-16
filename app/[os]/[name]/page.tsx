import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getApp, getAlternatives } from "@/lib/app-utils";
import { getCategoryByMain } from "@/lib/categories";
import { FaqItem } from "@/types/app";
import { Download, ShieldCheck, Star, ThumbsUp, XCircle, CheckCircle2, ChevronDown } from "lucide-react";

export const revalidate = 86400;

const SITE_URL = "https://ssdown.app";
const SITE_NAME = "SSDown";

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ os: string; name: string }>;
}): Promise<Metadata> {
  const { os, name } = await params;
  const app = await getApp(os, name);
  if (!app) return {};

  const title = `Download ${app.core.name} for ${app.core.platform} - ${SITE_NAME}`;
  const description = app.seo.description ||
    `Download ${app.core.name} ${app.core.version} for ${app.core.platform}. ${app.content.shortSummary}`.slice(0, 160);
  const canonical = `${SITE_URL}/${os}/${name}`;
  const ogImage = app.content.iconUrl || app.seo.ogImage || `${SITE_URL}/og-default.png`;
  const keywords = [
    `${app.core.name} download`,
    `${app.core.name} for ${app.core.platform}`,
    `${app.core.name} free download`,
    app.core.category.main,
    `${app.core.platform} software`,
    ...(app.seo.keywords ?? []),
  ].filter(Boolean).join(", ");

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 512, height: 512, alt: app.core.name }],
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function SoftwareApplicationJsonLd({ os, name }: { os: string; name: string }) {
  // Rendered client-side after app data is available — we pass via props from parent
  return null;
}

function AppJsonLd({
  app,
  os,
  name,
}: {
  app: NonNullable<Awaited<ReturnType<typeof getApp>>>;
  os: string;
  name: string;
}) {
  const platformMap: Record<string, string> = {
    windows: "http://schema.org/DesktopWebPlatform",
    mac: "http://schema.org/DesktopWebPlatform",
    android: "http://schema.org/AndroidPlatform",
    iphone: "http://schema.org/IOSPlatform",
    ios: "http://schema.org/IOSPlatform",
  };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.core.name,
    description: app.content.shortSummary || app.seo.description,
    url: `${SITE_URL}/${os}/${name}`,
    applicationCategory: app.core.category.main,
    operatingSystem: app.core.platform,
    ...(platformMap[os] && { targetPlatform: platformMap[os] }),
    ...(app.core.version && { softwareVersion: app.core.version }),
    ...(app.download.fileSize && app.download.fileSize !== "N/A" && { fileSize: app.download.fileSize }),
    ...(app.content.iconUrl && {
      image: app.content.iconUrl,
      thumbnailUrl: app.content.iconUrl,
    }),
    ...(app.core.developer.name && {
      author: {
        "@type": "Organization",
        name: app.core.developer.name,
        ...(app.core.developer.websiteUrl && { url: app.core.developer.websiteUrl }),
      },
    }),
    offers: {
      "@type": "Offer",
      price: app.download.license === "Free" || app.download.license === "Open Source" ? "0" : String(app.download.price ?? ""),
      priceCurrency: app.download.currency ?? "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/${os}/${name}`,
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
    ...(app.specs.lastUpdatedDate && {
      dateModified: new Date(app.specs.lastUpdatedDate).toISOString().split("T")[0],
    }),
  };

  // FAQ schema if available
  const schemas: unknown[] = [jsonLd];
  if (app.content.faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: app.content.faq.map((item: FaqItem) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  // BreadcrumbList
  const category = getCategoryByMain(app.core.category.main);
  const breadcrumbElements = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Software", item: `${SITE_URL}/software` },
  ];

  if (category) {
    breadcrumbElements.push({
      "@type": "ListItem",
      position: 3,
      name: category.name,
      item: `${SITE_URL}/software/${category.slug}`,
    });
  }

  breadcrumbElements.push({
    "@type": "ListItem",
    position: category ? 4 : 3,
    name: app.core.name,
    item: `${SITE_URL}/${os}/${name}`,
  });

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbElements,
  });

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AppDownloadPage({
  params,
}: {
  params: Promise<{ os: string; name: string }>;
}) {
  const { os, name } = await params;
  const app = await getApp(os, name);

  if (!app) notFound();

  const alternatives = await getAlternatives(app);

  const securityLabel = {
    Safe: "안전",
    Warning: "주의",
    Dangerous: "위험",
    Unknown: "확인 중",
  }[app.download.security.status];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AppJsonLd app={app} os={os} name={name} />

      {/* ── Hero / Header ── */}
      <section className="bg-white border-b py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6">

          {/* 아이콘 */}
          <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center relative">
            {app.content.iconUrl ? (
              <Image
                src={app.content.iconUrl}
                alt={`${app.core.name} icon`}
                className="w-full h-full object-cover"
                width={96}
                height={96}
                priority
              />
            ) : (
              <span className="text-3xl font-bold text-gray-400">{app.core.name.charAt(0)}</span>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {app.core.name}
              <span className="text-gray-400 font-normal text-xl ml-2">for {app.core.platform}</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {app.core.developer.name}
              {app.core.category.main && ` · ${app.core.category.main}`}
              {app.core.category.sub && app.core.category.sub !== app.core.category.main && ` > ${app.core.category.sub}`}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-medium">
              {app.rating.average > 0 && (
                <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {app.rating.average.toFixed(1)}
                  {app.rating.totalCount > 0 && (
                    <span className="text-gray-400 font-normal">({app.rating.totalCount.toLocaleString()})</span>
                  )}
                </span>
              )}
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                {app.download.license}
              </span>
              {app.core.version && (
                <span className="text-gray-400">v{app.core.version}</span>
              )}
              {app.download.downloadCount && (
                <span className="text-gray-500">다운로드 {app.download.downloadCount}</span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2 shrink-0">
            <a
              href={app.download.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-64 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-green-200"
            >
              <Download className="w-6 h-6" />
              <span>무료 다운로드</span>
            </a>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>보안 {securityLabel} · {app.download.fileSize}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 본문 ── */}
      <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-8 py-8 px-4 sm:px-6 lg:px-8">

        {/* ── 왼쪽 콘텐츠 ── */}
        <div className="flex-1 space-y-8 min-w-0">

          {/* 요약 */}
          {app.content.shortSummary && (
            <p className="text-gray-700 text-base leading-relaxed">{app.content.shortSummary}</p>
          )}

          {/* 장점 / 단점 */}
          {(app.content.pros.length > 0 || app.content.cons.length > 0) && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-5">장점 및 단점</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {app.content.pros.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                      <ThumbsUp className="w-5 h-5" /> 장점
                    </h3>
                    <ul className="space-y-2">
                      {app.content.pros.map((pro: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {app.content.cons.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
                      <XCircle className="w-5 h-5" /> 단점
                    </h3>
                    <ul className="space-y-2">
                      {app.content.cons.map((con: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 스크린샷 */}
          {app.content.screenshotUrls.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">스크린샷</h2>
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
                {app.content.screenshotUrls.map((url: string, idx: number) => (
                  <div key={idx} className="w-80 h-48 shrink-0 bg-gray-200 rounded-xl overflow-hidden snap-center relative">
                    <Image
                      src={url}
                      alt={`${app.core.name} screenshot ${idx + 1} on ${app.core.platform}`}
                      className="w-full h-full object-cover"
                      width={640}
                      height={360}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 에디터 리뷰 */}
          {(app.content.aiReviewHtml || app.content.editorReviewHtml) && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Editor Review</h2>
              <div
                className="prose prose-sm prose-blue max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: app.content.aiReviewHtml || app.content.editorReviewHtml }}
              />
            </section>
          )}

          {/* 상세 설명 */}
          {app.content.bodyHtml && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">{app.core.name} 상세 정보</h2>
              <div
                className="prose prose-sm prose-blue max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: app.content.bodyHtml }}
              />
            </section>
          )}

          {/* Alternatives & Comparison (GEO/AEO Optimization) */}
          {alternatives.length > 0 && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-2">Best alternatives to {app.core.name}</h2>
              <p className="text-sm text-gray-500 mb-6">Looking for something else? Here are the top-rated {app.core.category.main} alternatives for {app.core.platform}.</p>
              
              {/* Simple Comparison Table for GEO */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-4 font-bold text-gray-900">Feature</th>
                      <th className="py-3 px-4 font-bold text-blue-600">{app.core.name}</th>
                      <th className="py-3 px-4 font-bold text-gray-900">{alternatives[0].core.name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 px-4 text-gray-500">License</td>
                      <td className="py-3 px-4 font-medium">{app.download.license}</td>
                      <td className="py-3 px-4">{alternatives[0].download.license}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-500">Rating</td>
                      <td className="py-3 px-4 font-medium text-amber-600">{app.rating.average.toFixed(1)} / 5</td>
                      <td className="py-3 px-4">{alternatives[0].rating.average.toFixed(1)} / 5</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-500">Platform</td>
                      <td className="py-3 px-4 font-medium">{app.core.platform}</td>
                      <td className="py-3 px-4">{alternatives[0].core.platform}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Alternatives List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {alternatives.map((alt) => (
                  <Link 
                    key={alt.core.id} 
                    href={`/${alt.core.platform.toLowerCase()}/${alt.core.id.split('-').slice(1).join('-') || alt.core.id}`}
                    className="flex items-center gap-4 p-4 border rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                      {alt.content.iconUrl && (
                        <Image src={alt.content.iconUrl} alt={alt.core.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600">{alt.core.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-gray-500">{alt.rating.average.toFixed(1)}</span>
                        <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-400">{alt.download.license}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          {app.content.faq.length > 0 && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">자주 묻는 질문</h2>
              <div className="space-y-3">
                {app.content.faq.map((item: FaqItem, idx: number) => (
                  <details key={idx} className="group border border-gray-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-medium text-gray-800 hover:bg-gray-50 list-none">
                      <span>{item.question}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* ── 오른쪽 사이드바 ── */}
        <div className="lg:w-72 shrink-0 space-y-6">

          {/* 앱 사양 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">앱 사양</h3>
            <dl className="space-y-3 text-sm">
              {app.core.version && (
                <div>
                  <dt className="text-gray-400 mb-0.5">버전</dt>
                  <dd className="font-medium text-gray-900">{app.core.version}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-400 mb-0.5">라이선스</dt>
                <dd className="font-medium text-gray-900">{app.download.license}</dd>
              </div>
              {app.download.fileSize && app.download.fileSize !== 'N/A' && (
                <div>
                  <dt className="text-gray-400 mb-0.5">파일 크기</dt>
                  <dd className="font-medium text-gray-900">{app.download.fileSize}</dd>
                </div>
              )}
              {app.download.downloadCount && (
                <div>
                  <dt className="text-gray-400 mb-0.5">다운로드</dt>
                  <dd className="font-medium text-gray-900">{app.download.downloadCount}</dd>
                </div>
              )}
              {app.specs.osRequirements && (
                <div>
                  <dt className="text-gray-400 mb-0.5">OS 요구사항</dt>
                  <dd className="font-medium text-gray-900">{app.specs.osRequirements}</dd>
                </div>
              )}
              {app.specs.languages.length > 0 && (
                <div>
                  <dt className="text-gray-400 mb-0.5">언어</dt>
                  <dd className="font-medium text-gray-900">{app.specs.languages.join(", ")}</dd>
                </div>
              )}
              {app.specs.lastUpdatedDate && (
                <div>
                  <dt className="text-gray-400 mb-0.5">업데이트</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(app.specs.lastUpdatedDate).toLocaleDateString("ko-KR")}
                  </dd>
                </div>
              )}
              {app.core.developer.name && (
                <div>
                  <dt className="text-gray-400 mb-0.5">개발사</dt>
                  <dd className="font-medium text-gray-900">
                    {app.core.developer.websiteUrl ? (
                      <a href={app.core.developer.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {app.core.developer.name}
                      </a>
                    ) : app.core.developer.name}
                  </dd>
                </div>
              )}
              {app.core.supportedPlatforms.length > 1 && (
                <div>
                  <dt className="text-gray-400 mb-0.5">지원 플랫폼</dt>
                  <dd className="font-medium text-gray-900">{app.core.supportedPlatforms.join(", ")}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* 보안 정보 */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-8 h-8 shrink-0 ${
                app.download.security.status === 'Safe' ? 'text-green-500' :
                app.download.security.status === 'Warning' ? 'text-yellow-500' :
                app.download.security.status === 'Dangerous' ? 'text-red-500' : 'text-gray-400'
              }`} />
              <div>
                <p className="font-semibold text-gray-900 text-sm">보안 상태: {securityLabel}</p>
                {app.download.security.scanProvider && (
                  <p className="text-xs text-gray-400">{app.download.security.scanProvider}</p>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
