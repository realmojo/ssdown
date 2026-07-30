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
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import {
  getAppById,
  getAlternatives,
  getLatestApps,
  localizeApp,
  hasKoreanContent,
} from "@/lib/app-utils";
import { getCategoryByMain, getCategoryBySlug } from "@/lib/categories";
import { buildAlternates } from "@/lib/seo";
import Adsense from "@/components/Adsense";
import type { SoftwareApplication } from "@/types/app";
import { PageShell } from "@/components/portal/page-shell";

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
    `${nameWithPlatform(app.core.name, app.core.platform)}용 다운로드 — ${licenseLabel} | SSDown`;
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
    ...(app.seo.keywords ?? []),
  ]
    .filter(Boolean)
    .join(", ");

  // 한국어 본문이 없는 앱은 영문이 노출되므로 색인에서 제외한다.
  const indexable = hasKoreanContent(rawApp);

  return {
    title: defaultTitle,
    description: defaultDesc,
    keywords,
    robots: { index: indexable, follow: true },
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
        { title: "APK 내려받기", desc: `아래 다운로드 버튼을 눌러 ${name} 설치 파일을 저장합니다.` },
        { title: "출처를 알 수 없는 앱 허용", desc: "설정 › 보안에서 해당 브라우저의 설치 권한을 켭니다." },
        { title: "설치 실행", desc: "받은 APK 파일을 열고 안내에 따라 설치를 진행합니다." },
        { title: "앱 실행", desc: "설치가 끝나면 홈 화면에서 바로 실행할 수 있습니다." },
      ];
    case "iOS":
      return [
        { title: "App Store 열기", desc: `아래 버튼을 누르면 ${name} 의 App Store 페이지로 이동합니다.` },
        { title: "받기 누르기", desc: "받기(또는 설치) 버튼을 눌러 내려받습니다." },
        { title: "인증 완료", desc: "Face ID·Touch ID 또는 비밀번호로 설치를 승인합니다." },
        { title: "앱 실행", desc: "홈 화면에 추가된 아이콘을 눌러 실행합니다." },
      ];
    case "Mac":
      return [
        { title: "설치 파일 내려받기", desc: `아래 버튼을 눌러 ${name} 의 dmg 또는 pkg 파일을 저장합니다.` },
        { title: "디스크 이미지 열기", desc: "받은 파일을 더블클릭해 마운트합니다." },
        { title: "응용 프로그램으로 이동", desc: "앱 아이콘을 응용 프로그램 폴더로 끌어다 놓습니다." },
        { title: "첫 실행 허용", desc: "처음 실행할 때 보안 경고가 뜨면 시스템 설정에서 열기를 허용합니다." },
      ];
    default:
      return [
        { title: "설치 파일 내려받기", desc: `아래 다운로드 버튼을 눌러 ${name} 설치 파일을 저장합니다.` },
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
            {a.core.name}
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
  const secStyle = SECURITY_STYLE[app.download.security.status] ?? SECURITY_STYLE.Unknown;
  const steps = installSteps(app);
  const faq = buildFaq(app);
  const hasPros = app.content.pros.length > 0;
  const hasCons = app.content.cons.length > 0;
  const reviewHtml =
    app.content.aiReviewHtml || app.content.editorReviewHtml || app.content.bodyHtml;
  const adSlot = PLATFORM_AD_SLOT[app.core.platform] ?? "6067594441";
  const showDeveloper = isRealDeveloper(app.core.developer.name);

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
    offers: {
      "@type": "Offer",
      price:
        app.download.license === "Free" || app.download.license === "Open Source"
          ? "0"
          : String(app.download.price ?? ""),
      priceCurrency: app.download.currency ?? "USD",
      availability: "https://schema.org/InStock",
    },
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
    ...(app.download.downloadUrl &&
      app.download.downloadUrl !== "#" && { downloadUrl: app.download.downloadUrl }),
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <PageShell
        sidebar={false}
        crumbs={[
          { label: "소프트웨어", href: "/software" },
          ...(category ? [{ label: category.name, href: `/software/${category.slug}` }] : []),
          { label: app.core.name },
        ]}
      >

        {/* ── 히어로 카드 ───────────────────────────────────────── */}
        <section className="overflow-hidden rounded-[2px] border border-[var(--pt-line)] bg-white">
          <div className="flex flex-col gap-2 p-3 sm:p-3 lg:flex-row lg:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-gray-100 sm:h-28 sm:w-28">
              {app.content.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={app.content.iconUrl} alt={app.core.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-gray-300">{app.core.name.charAt(0)}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl">
                {app.core.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                {app.rating.average > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(app.rating.average)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </span>
                    <span className="font-bold text-gray-900">{app.rating.average.toFixed(1)}</span>
                    {app.rating.totalCount > 0 && (
                      <span className="text-xs text-gray-400">
                        ({app.rating.totalCount.toLocaleString()}개 평가)
                      </span>
                    )}
                  </span>
                )}
                {showDeveloper &&
                  (app.core.developer.websiteUrl ? (
                    <a
                      href={app.core.developer.websiteUrl}
                      target="_blank"
                      rel="nofollow noopener"
                      className="inline-flex items-center gap-0.5 text-gray-500 transition-colors hover:text-blue-600"
                    >
                      {app.core.developer.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-gray-500">{app.core.developer.name}</span>
                  ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${licStyle.chip}`}>
                  {licStyle.label}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {plat}
                </span>
                {category && (
                  <a
                    href={`/software/${category.slug}`}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    {category.name}
                  </a>
                )}
              </div>

              {app.content.shortSummary && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">
                  {app.content.shortSummary}
                </p>
              )}
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 lg:w-56">
              <a
                href={app.download.downloadUrl}
                target="_blank"
                rel="nofollow noopener"
                className="flex items-center justify-center gap-2 rounded-[2px] bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/30"
              >
                <Download className="h-4 w-4" />
                다운로드
              </a>
              <div className="flex items-center justify-center gap-1.5 text-xs">
                <ShieldCheck className={`h-3.5 w-3.5 ${secStyle.color}`} />
                <span className={`font-medium ${secStyle.color}`}>
                  바이러스 검사 완료 · {secStyle.label}
                </span>
              </div>
            </div>
          </div>

          {/* 요약 지표 */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 sm:grid-cols-4">
            {[
              { icon: HardDrive, label: "파일 크기", value: fileSize || "—" },
              { icon: Tag, label: "라이선스", value: licStyle.label },
              { icon: Monitor, label: "플랫폼", value: plat },
              {
                icon: Calendar,
                label: "업데이트",
                value: app.specs.lastUpdatedDate
                  ? new Date(app.specs.lastUpdatedDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "short",
                    })
                  : "—",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-3.5">
                <Icon className="h-4 w-4 shrink-0 text-gray-300" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">{label}</div>
                  <div className="truncate text-xs font-semibold text-gray-700">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_320px]">
          {/* ── 본문 ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            {/* 설치 방법 */}
            <section className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-7">
              <h2 className="text-lg font-bold text-gray-900">
                {nameWithPlatform(app.core.name, app.core.platform)} 설치 방법
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                아래 순서대로 진행하면 몇 분 안에 설치를 마칠 수 있습니다.
              </p>
              <ol className="mt-5 space-y-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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

            <Adsense slotId={adSlot} format="horizontal" />

            {/* 주요 특징 */}
            {hasPros && (
              <section className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-7">
                <h2 className="text-lg font-bold text-gray-900">주요 특징</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {app.content.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </span>
                      <span className="text-sm leading-snug text-gray-700">{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 리뷰 본문 */}
            {reviewHtml && (
              <section className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-7">
                <h2 className="text-lg font-bold text-gray-900">{app.core.name} 상세 리뷰</h2>
                <div
                  className="prose prose-sm prose-gray mt-4 max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-blue-600 prose-table:text-sm"
                  dangerouslySetInnerHTML={{ __html: reviewHtml }}
                />
              </section>
            )}

            {/* 장단점 */}
            {(hasPros || hasCons) && (
              <section className="grid gap-4 sm:grid-cols-2">
                {hasPros && (
                  <div className="rounded-[2px] border border-emerald-100 bg-emerald-50/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      </span>
                      <h2 className="text-sm font-bold text-gray-900">장점</h2>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {app.content.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                          <span className="text-sm leading-snug text-gray-700">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hasCons && (
                  <div className="rounded-[2px] border border-rose-100 bg-rose-50/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100">
                        <X className="h-3.5 w-3.5 text-rose-600" />
                      </span>
                      <h2 className="text-sm font-bold text-gray-900">단점</h2>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {app.content.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                          <span className="text-sm leading-snug text-gray-700">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* 자주 묻는 질문 */}
            <section className="rounded-[2px] border border-[var(--pt-line)] bg-white p-3 sm:p-7">
              <h2 className="text-lg font-bold text-gray-900">자주 묻는 질문</h2>
              <div className="mt-4 divide-y divide-gray-100">
                {faq.map((f, i) => (
                  <details key={i} className="group py-3.5" open={i === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-gray-900 transition-colors hover:text-blue-600">
                      {f.q}
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* ── 사이드바 ─────────────────────────────────────────── */}
          <aside className="space-y-4">
            <div className="lg:sticky lg:top-20 lg:space-y-4">
              <div className="rounded-[2px] border border-[var(--pt-line)] bg-white p-5">
                <a
                  href={app.download.downloadUrl}
                  target="_blank"
                  rel="nofollow noopener"
                  className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
                >
                  <Download className="h-4 w-4" />
                  다운로드
                </a>
                {app.core.developer.websiteUrl && (
                  <a
                    href={app.core.developer.websiteUrl}
                    target="_blank"
                    rel="nofollow noopener"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[2px] border border-[var(--pt-line)] py-2.5 text-xs text-gray-500 transition-colors hover:border-blue-200 hover:text-blue-600"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    공식 홈페이지
                  </a>
                )}

                <dl className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-xs">
                  {specRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="shrink-0 text-gray-400">{k}</dt>
                      <dd className="text-right font-medium text-gray-700">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <Adsense slotId={adSlot} format="rectangle" />

              {app.rating.average > 0 && (
                <div className="rounded-[2px] border border-[var(--pt-line)] bg-white p-5">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">평점</h2>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-4xl font-black leading-none text-gray-900">
                      {app.rating.average.toFixed(1)}
                    </span>
                    <div className="pb-1">
                      <div className="mb-1 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.round(app.rating.average)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      {app.rating.totalCount > 0 && (
                        <p className="text-[11px] text-gray-400">
                          {app.rating.totalCount.toLocaleString()}개 평가
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
