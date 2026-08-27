import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Download,
  Star,
  Check,
  X,
} from "lucide-react";
import {
  getAppById,
  getAlternatives,
  getLatestApps,
  localizeApp,
} from "@/lib/app-utils";
import { getCategoryByMain, getCategoryBySlug } from "@/lib/categories";
import { resolveDistribution } from "@/lib/app-href";
import { buildAlternates } from "@/lib/seo";
import Adsense from "@/components/Adsense";
import type { SoftwareApplication } from "@/types/app";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

const PLATFORM_AD_SLOT: Record<string, string> = {
  Windows: "6067594441",
  Mac: "4754512774",
  Android: "5471730473",
  iOS: "1235772885",
};

const LICENSE_LABEL_KR: Record<string, string> = {
  Free: "무료",
  Freemium: "부분 무료",
  "Open Source": "오픈소스",
  Trial: "체험판",
  Paid: "유료",
};

/** 플랫폼별 표기 (iOS 는 사용자에게 iPhone 으로 보여준다). */
function platformLabel(platform: string): string {
  return platform === "iOS" ? "iPhone" : platform;
}

/**
 * 제목에 쓸 "앱 이름 + 플랫폼". DB의 앱 이름 상당수가 이미 "... for Windows"
 * 처럼 플랫폼으로 끝나므로, 그대로 이어 붙이면 "for Windows Windows" 가 된다.
 * 이미 플랫폼이 들어 있으면 덧붙이지 않는다.
 */
function nameWithPlatform(name: string, platform: string): string {
  const plat = platformLabel(platform);
  const hay = name.toLowerCase();
  const needles = [plat.toLowerCase(), platform.toLowerCase()];
  if (needles.some((n) => hay.includes(n))) return name;
  return `${name} ${plat}`;
}

/** 스크래핑 데이터의 "N/A" 같은 자리표시자를 빈 값으로 본다. */
function cleanValue(v?: string): string {
  const t = (v ?? "").trim();
  return !t || /^(n\/?a|unknown|없음|-)$/i.test(t) ? "" : t;
}

export const revalidate = 3600;

/** 애드센스 슬롯 — ssdown(down). 히어로의 다운로드 버튼 자리에 놓는다. */
const HERO_AD_SLOT = "9206933412";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}): Promise<Metadata> {
  const { category, id } = await params;
  const rawApp = await getAppById(id);
  if (!rawApp) return {};
  const app = localizeApp(rawApp);
  const canonicalPath = `/software${app.core.slug || `/${category}/${id}`}`;
  const plat = platformLabel(app.core.platform);
  const licenseLabel = LICENSE_LABEL_KR[app.download.license] ?? "무료";
  const defaultTitle =
    app.seo.title ||
    `${nameWithPlatform(app.core.name, app.core.platform)}용 다운로드 — ${licenseLabel}`;
  const defaultDesc =
    app.seo.description ||
    `${nameWithPlatform(app.core.name, app.core.platform)} 버전을 무료로 다운로드하세요. ${app.content.shortSummary}`.trim();
  const keywords = [
    `${app.core.name} 다운로드`,
    nameWithPlatform(app.core.name, app.core.platform),
    `${app.core.name} 무료`,
    `${app.core.name} ${licenseLabel}`,
    `${app.core.category.main} 소프트웨어`,
    `${plat} ${app.core.category.main} 추천`,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title: defaultTitle,
    description: defaultDesc,
    keywords,
    robots: { index: true, follow: true },
    alternates: buildAlternates(canonicalPath),
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: `https://ssdown.app${canonicalPath}`,
      siteName: "SSDown",
      type: "website",
      images: app.content.iconUrl
        ? [{ url: app.content.iconUrl, width: 512, height: 512, alt: app.core.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDesc,
      images: app.content.iconUrl ? [app.content.iconUrl] : [],
    },
  };
}

const LICENSE_STYLE: Record<string, { chip: string; label: string }> = {
  Free: { chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "무료" },
  Freemium: { chip: "bg-teal-50 text-teal-700 ring-teal-200", label: "부분 무료" },
  "Open Source": { chip: "bg-blue-50 text-blue-700 ring-blue-200", label: "오픈소스" },
  Trial: { chip: "bg-amber-50 text-amber-700 ring-amber-200", label: "체험판" },
  Paid: { chip: "bg-rose-50 text-rose-700 ring-rose-200", label: "유료" },
};

const SECURITY_STYLE: Record<string, { color: string; label: string }> = {
  Safe: { color: "text-emerald-600", label: "안전" },
  Warning: { color: "text-amber-600", label: "주의" },
  Dangerous: { color: "text-rose-600", label: "위험" },
  Unknown: { color: "text-gray-400", label: "미확인" },
};

/** 플랫폼별 설치 단계. 참고 사이트처럼 번호가 붙은 안내로 보여준다. */
function installSteps(app: SoftwareApplication): { title: string; desc: string }[] {
  const name = app.core.name;
  switch (app.core.platform) {
    case "Android":
      return [
        { title: "APK 내려받기", desc: `공식 홈페이지에서 ${name} 설치 파일을 내려받아 저장합니다.` },
        { title: "출처를 알 수 없는 앱 허용", desc: "설정 › 보안에서 해당 브라우저의 설치 권한을 켭니다." },
        { title: "설치 실행", desc: "받은 APK 파일을 열고 안내에 따라 설치를 진행합니다." },
        { title: "앱 실행", desc: "설치가 끝나면 홈 화면에서 바로 실행할 수 있습니다." },
      ];
    case "iOS":
      return [
        { title: "App Store 열기", desc: `App Store 에서 ${name} 을(를) 검색하거나 공식 홈페이지의 링크로 이동합니다.` },
        { title: "받기 누르기", desc: "받기(또는 설치) 버튼을 눌러 내려받습니다." },
        { title: "인증 완료", desc: "Face ID·Touch ID 또는 비밀번호로 설치를 승인합니다." },
        { title: "앱 실행", desc: "홈 화면에 추가된 아이콘을 눌러 실행합니다." },
      ];
    case "Mac":
      return [
        { title: "설치 파일 내려받기", desc: `공식 홈페이지에서 ${name} 의 dmg 또는 pkg 파일을 내려받습니다.` },
        { title: "디스크 이미지 열기", desc: "받은 파일을 더블클릭해 마운트합니다." },
        { title: "응용 프로그램으로 이동", desc: "앱 아이콘을 응용 프로그램 폴더로 끌어다 놓습니다." },
        { title: "첫 실행 허용", desc: "처음 실행할 때 보안 경고가 뜨면 시스템 설정에서 열기를 허용합니다." },
      ];
    default:
      return [
        { title: "설치 파일 내려받기", desc: `공식 홈페이지에서 ${name} 설치 파일을 내려받아 저장합니다.` },
        { title: "설치 파일 실행", desc: "받은 파일을 더블클릭해 설치 마법사를 시작합니다." },
        { title: "안내에 따라 설치", desc: "설치 경로와 옵션을 확인하고 진행합니다." },
        { title: "프로그램 실행", desc: "설치가 끝나면 바탕화면이나 시작 메뉴에서 실행합니다." },
      ];
  }
}

/** 상세 데이터로 만드는 FAQ. 화면 표시와 FAQPage 스키마에 함께 쓴다. */
function buildFaq(app: SoftwareApplication): { q: string; a: string }[] {
  const name = app.core.name;
  const plat = platformLabel(app.core.platform);
  const fileSize = cleanValue(app.download.fileSize);
  const osReq = cleanValue(app.specs.osRequirements);
  const lic = LICENSE_LABEL_KR[app.download.license] ?? "무료";
  const faq: { q: string; a: string }[] = [
    {
      q: `${name}는 무료로 쓸 수 있나요?`,
      a:
        app.download.license === "Free" || app.download.license === "Open Source"
          ? `네, ${name}는 ${lic}으로 제공되어 비용 없이 내려받아 사용할 수 있습니다.`
          : `${name}는 ${lic} 방식입니다. 기능이나 사용 기간에 제한이 있을 수 있으니 개발사 안내를 확인해 주세요.`,
    },
    {
      q: `${name}는 안전한가요?`,
      a:
        app.download.security.status === "Safe"
          ? `보안 검사에서 안전으로 확인된 파일입니다. 다만 항상 공식 배포처에서 내려받는 것을 권장합니다.`
          : `보안 상태가 "${SECURITY_STYLE[app.download.security.status]?.label ?? "미확인"}"으로 표시되어 있습니다. 설치 전 백신으로 한 번 더 검사해 주세요.`,
    },
    {
      q: `어떤 환경에서 사용할 수 있나요?`,
      a: osReq
        ? `${plat} 환경에서 사용할 수 있으며, 요구 사양은 ${osReq} 입니다.`
        : `${plat} 환경에서 사용할 수 있습니다.`,
    },
  ];
  if (fileSize) {
    faq.push({
      q: "파일 용량은 얼마인가요?",
      a: `설치 파일 용량은 약 ${fileSize} 입니다. 설치 후 사용 공간은 이보다 클 수 있습니다.`,
    });
  }
  if (app.specs.languages?.length) {
    faq.push({
      q: "한국어를 지원하나요?",
      a: app.specs.languages.some((l) => /korean|한국/i.test(l))
        ? `네, 한국어를 지원합니다. 지원 언어: ${app.specs.languages.slice(0, 6).join(", ")}`
        : `현재 확인된 지원 언어는 ${app.specs.languages.slice(0, 6).join(", ")} 입니다.`,
    });
  }
  return faq;
}

/** 스크래핑 잔여물로 들어온 가짜 개발자명을 걸러낸다. */
function isRealDeveloper(name?: string): boolean {
  if (!name) return false;
  const t = name.trim();
  if (!t || t === "Unknown") return false;
  return !/^More programs\s*\(\d+\)$/.test(t);
}

function buildAppHref(a: SoftwareApplication): string {
  const cat = getCategoryByMain(a.core.category.main);
  return `/software${a.core.slug || `/${cat?.slug ?? "utilities"}/${a.core.id}`}`;
}

/** 하단 관련 앱 그리드에서 반복되는 카드. */
function AppCard({ a }: { a: SoftwareApplication }) {
  return (
    <a
      href={buildAppHref(a)}
      className="group flex flex-col gap-2 rounded-[2px] border border-[var(--pt-line)] bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-gray-100">
          {a.content.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.content.iconUrl} alt={a.core.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="text-base font-bold text-gray-400">{a.core.name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
            {a.core.name} 다운로드
          </p>
          <p className="truncate text-[11px] text-gray-400">{a.core.category.main}</p>
        </div>
      </div>
      {a.rating.average > 0 && (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-medium text-gray-600">{a.rating.average.toFixed(1)}</span>
        </div>
      )}
    </a>
  );
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category: categorySlug, id } = await params;
  const rawApp = await getAppById(id);
  if (!rawApp) notFound();
  const app = localizeApp(rawApp);

  const [alternativesRaw, latestRaw] = await Promise.all([
    getAlternatives(app, 8),
    getLatestApps(app.core.id, 8, app.core.platform),
  ]);
  const alternatives = alternativesRaw.map(localizeApp);
  const latest = latestRaw.map(localizeApp);

  const category =
    getCategoryBySlug(categorySlug) ?? getCategoryByMain(app.core.category.main);
  const canonicalPath = `/software${app.core.slug || `/${category?.slug ?? categorySlug}/${id}`}`;
  const canonicalUrl = `https://ssdown.app${canonicalPath}`;

  const plat = platformLabel(app.core.platform);
  const fileSize = cleanValue(app.download.fileSize);
  const osReq = cleanValue(app.specs.osRequirements);
  const licStyle = LICENSE_STYLE[app.download.license] ?? LICENSE_STYLE.Free;
  const steps = installSteps(app);
  const faq = buildFaq(app);
  const hasPros = app.content.pros.length > 0;
  const hasCons = app.content.cons.length > 0;
  const reviewHtml =
    app.content.aiReviewHtml || app.content.editorReviewHtml || app.content.bodyHtml;
  const adSlot = PLATFORM_AD_SLOT[app.core.platform] ?? "6067594441";
  const showDeveloper = isRealDeveloper(app.core.developer.name);

  /*
    안내할 배포처가 없으면 진입 버튼을 아예 내지 않는다. 버튼을 눌러 봐야
    받을 곳이 없는 안내 페이지(이제 404 다)로 보내게 될 뿐이다.
  */
  const distribution = resolveDistribution(app);

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.core.name,
    description: app.content.shortSummary || app.seo.description,
    url: canonicalUrl,
    applicationCategory: app.core.category.main,
    operatingSystem: app.core.platform,
    ...(fileSize && { fileSize }),
    ...(app.content.iconUrl && { image: app.content.iconUrl }),
    ...(app.specs.lastUpdatedDate && {
      dateModified: new Date(app.specs.lastUpdatedDate).toISOString(),
    }),
    /*
      가격은 라이선스로만 판단한다. 값을 모르는 라이선스(체험판 등)에서는
      offers 자체를 빼는 편이 낫다 — price 가 빈 Offer 는 유효하지 않은 마크업이다.
    */
    ...((app.download.license === "Free" || app.download.license === "Open Source") && {
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    }),
    ...(app.rating.average > 0 &&
      app.rating.totalCount > 0 && {
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
      name: showDeveloper ? app.core.developer.name : "미상",
      ...(app.core.developer.websiteUrl && { url: app.core.developer.websiteUrl }),
    },
    /*
      downloadUrl 은 배포 파일로 가는 주소를 뜻한다. 개발사 홈페이지로 폴백한
      경우는 파일 주소가 아니므로 넣지 않는다 — 스키마가 실제로 제공하지 않는
      다운로드를 광고하게 된다.
    */
    ...(distribution?.kind === "download" && { downloadUrl: distribution.url }),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${nameWithPlatform(app.core.name, app.core.platform)} 설치 방법`,
    description: `${app.core.name} 를 ${plat} 환경에 설치하는 방법을 단계별로 안내합니다.`,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "소프트웨어", item: "https://ssdown.app/software" },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: `https://ssdown.app/software/${category.slug}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: category ? 4 : 3, name: app.core.name, item: canonicalUrl },
    ],
  };

  const specRows: [string, string][] = [
    ["플랫폼", plat],
    ["라이선스", licStyle.label],
    ...(fileSize ? ([["파일 크기", fileSize]] as [string, string][]) : []),
    ...(osReq ? ([["운영체제 요구사항", osReq]] as [string, string][]) : []),
    ...(app.specs.languages?.length
      ? ([["지원 언어", app.specs.languages.slice(0, 4).join(", ")]] as [string, string][])
      : []),
    ...(showDeveloper ? ([["개발사", app.core.developer.name]] as [string, string][]) : []),
    ["카테고리", category?.name ?? app.core.category.main],
    ...(app.specs.lastUpdatedDate
      ? ([
          [
            "업데이트",
            new Date(app.specs.lastUpdatedDate).toLocaleDateString("ko-KR"),
          ],
        ] as [string, string][])
      : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <PageShell
        sidebar={false}
        crumbs={[
          { label: "소프트웨어", href: "/software" },
          ...(category ? [{ label: category.name, href: `/software/${category.slug}` }] : []),
          { label: app.core.name },
        ]}
      >

        {/*
          레이아웃: 왼쪽 본문 + 오른쪽 고정 레일.
          광고는 오른쪽 레일에만 정사각형으로 둔다. 본문 흐름을 가로지르는
          큰 가로 배너는 쓰지 않는다.
        */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ── 본문 ─────────────────────────────────────────────── */}
          <div className="min-w-0 space-y-2">
            {/* 앱 머리말 */}
            <section className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-5">
              <div className="flex gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-[var(--pt-line)] bg-white sm:h-20 sm:w-20">
                  {app.content.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.content.iconUrl}
                      alt={app.core.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-gray-300">
                      {app.core.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {/*
                    제목에 "다운로드"를 넣지 않는다. SSDown 은 설치 파일을 직접
                    제공하지 않으므로, 파일을 준다고 읽히는 표현은 쓰지 않는다.
                    플랫폼은 바로 아래 메타 줄에 이미 표시된다.
                  */}
                  <h1 className="text-xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-2xl">
                    {nameWithPlatform(app.core.name, app.core.platform)}
                  </h1>

                  {/* 한 줄 요약 정보. 값이 있는 것만 넣는다. */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    <span className="font-semibold text-emerald-700">{licStyle.label}</span>
                    {app.rating.average > 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="inline-flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {app.rating.average.toFixed(1)}
                          {app.rating.totalCount > 0 && (
                            <span className="text-gray-400">
                              ({app.rating.totalCount.toLocaleString()})
                            </span>
                          )}
                        </span>
                      </>
                    )}
                    <span className="text-gray-300">·</span>
                    <span>{plat}</span>
                    {category && (
                      <>
                        <span className="text-gray-300">·</span>
                        <a
                          href={`/software/${category.slug}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {category.name}
                        </a>
                      </>
                    )}
                    {showDeveloper && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>{app.core.developer.name}</span>
                      </>
                    )}
                  </div>

                  {app.content.shortSummary && (
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {app.content.shortSummary}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 가로형 광고 */}
            <Adsense slotId={adSlot} />

            {/* 상세 리뷰 */}
            {reviewHtml && (
              <section className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-7">
                <h2 className="text-lg font-bold text-gray-900">{app.core.name} 상세 리뷰</h2>
                <div
                  className="prose prose-sm prose-gray mt-4 max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-blue-600 prose-table:text-sm"
                  dangerouslySetInnerHTML={{ __html: reviewHtml }}
                />
              </section>
            )}

            {/* 장점 / 단점 */}
            {(hasPros || hasCons) && (
              <section className="grid gap-2 sm:grid-cols-2">
                {hasPros && (
                  <div className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-5">
                    <h2 className="text-sm font-bold text-gray-900">장점</h2>
                    <ul className="mt-3 space-y-2">
                      {app.content.pros.map((p) => (
                        <li key={p} className="flex gap-2 text-sm text-gray-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hasCons && (
                  <div className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-5">
                    <h2 className="text-sm font-bold text-gray-900">단점</h2>
                    <ul className="mt-3 space-y-2">
                      {app.content.cons.map((c) => (
                        <li key={c} className="flex gap-2 text-sm text-gray-700">
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* 설치 방법 */}
            <section className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-7">
              <h2 className="text-lg font-bold text-gray-900">
                {nameWithPlatform(app.core.name, app.core.platform)} 설치 방법
              </h2>
              <ol className="mt-4 space-y-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="pt-0.5">
                      <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* 자주 묻는 질문 */}
            <section className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-7">
              <h2 className="text-lg font-bold text-gray-900">자주 묻는 질문</h2>
              <div className="mt-4 divide-y divide-gray-100">
                {faq.map((f, i) => (
                  <details key={i} className="group py-3">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900">
                      {f.q}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/*
              본문 끝에 한 번 더 놓는 배포처 안내. 버튼이 없으면 머리말과 같은
              내용만 남는 빈 카드가 되므로 통째로 내지 않는다.
            */}
            {distribution && (
            <section className="flex flex-col gap-3 rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:flex-row sm:items-center sm:p-5">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-[var(--pt-line)] bg-white">
                  {app.content.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.content.iconUrl}
                      alt={app.core.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-black text-gray-300">
                      {app.core.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">{app.core.name}</p>
                  <p className="text-xs text-gray-500">
                    {licStyle.label} · {plat}
                    {fileSize ? ` · ${fileSize}` : ""}
                  </p>
                </div>
              </div>
              <a
                href={`${canonicalPath}/download`}
                className="flex shrink-0 items-center justify-center gap-2 rounded-[2px] bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
              >
                <Download className="h-4 w-4" />
                공식 배포처 안내
              </a>
            </section>
            )}
          </div>

          {/* ── 오른쪽 레일 ──────────────────────────────────────── */}
          <aside className="space-y-2">
            <div className="lg:sticky lg:top-20 lg:space-y-2">
              {/* 정사각 광고 */}
              <Adsense slotId={HERO_AD_SLOT} format="rectangle" />

              {/* 배포처 안내 + 사양. 배포처가 없어도 사양표는 그대로 쓸모가 있다. */}
              <div className="rounded-[2px] border border-[var(--pt-line)] bg-white p-4">
                {distribution && (
                  <a
                    href={`${canonicalPath}/download`}
                    className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
                  >
                    <Download className="h-4 w-4" />
                    공식 배포처 안내
                  </a>
                )}

                <dl
                  className={`space-y-2.5 text-xs ${
                    distribution ? "mt-4 border-t border-gray-100 pt-4" : ""
                  }`}
                >
                  {specRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="shrink-0 text-gray-400">{k}</dt>
                      <dd className="text-right font-medium text-gray-700">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* 같은 플랫폼에서 많이 찾는 앱 */}
              {latest.length > 0 && (
                <div className="rounded-[2px] border border-[var(--pt-line)] bg-white p-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    최신 {plat} 앱
                  </h2>
                  <ul className="mt-3 space-y-3">
                    {latest.slice(0, 5).map((a) => (
                      <li key={a.core.id}>
                        <a href={buildAppHref(a)} className="group flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-[var(--pt-line)] bg-white">
                            {a.content.iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.content.iconUrl}
                                alt={a.core.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-xs font-bold text-gray-300">
                                {a.core.name.charAt(0)}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-gray-800 group-hover:text-blue-600">
                              {a.core.name} 다운로드
                            </span>
                            <span className="block text-[11px] text-gray-400">
                              {a.core.category.main}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 정사각 광고 */}
              <Adsense slotId={adSlot} format="rectangle" />
            </div>
          </aside>
        </div>

        {/* ── 비슷한 앱 ─────────────────────────────────────────── */}
        {alternatives.length > 0 && (
          <section className="mt-2">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-900">비슷한 앱</h2>
              {category && (
                <a
                  href={`/software/${category.slug}`}
                  className="shrink-0 text-xs text-gray-400 transition-colors hover:text-blue-600"
                >
                  {category.name} 전체 보기 →
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {alternatives.map((a) => (
                <AppCard key={a.core.id} a={a} />
              ))}
            </div>
          </section>
        )}

        {/* ── 최신 등록 앱 ──────────────────────────────────────── */}
        {latest.length > 0 && (
          <section className="mt-2">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-900">최신 {plat} 앱</h2>
              <a
                href="/software"
                className="shrink-0 text-xs text-gray-400 transition-colors hover:text-blue-600"
              >
                전체 보기 →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {latest.map((a) => (
                <AppCard key={a.core.id} a={a} />
              ))}
            </div>
          </section>
        )}
      </PageShell>
    </>
  );
}
