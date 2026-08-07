import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronLeft, ExternalLink, Globe, ShieldAlert } from "lucide-react";
import { getAppById, localizeApp } from "@/lib/app-utils";
import { getCategoryByMain, getCategoryBySlug } from "@/lib/categories";
import { buildAppHref } from "@/lib/app-href";
import Adsense from "@/components/Adsense";
import { PageShell } from "@/components/portal/page-shell";

export const revalidate = 3600;

/** 애드센스 슬롯 — ssdown(down) */
const AD_SLOT = "9206933412";

const LICENSE_LABEL_KR: Record<string, string> = {
  Free: "무료",
  Freemium: "부분 무료",
  "Open Source": "오픈소스",
  Trial: "체험판",
  Paid: "유료",
};

function platformLabel(platform: string): string {
  return platform === "iOS" ? "iPhone" : platform;
}

/** 스크래핑 데이터의 "N/A" 같은 자리표시자를 빈 값으로 본다. */
function cleanValue(v?: string): string {
  const t = (v ?? "").trim();
  return !t || /^(n\/?a|unknown|없음|-)$/i.test(t) ? "" : t;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const rawApp = await getAppById(id);
  if (!rawApp) return {};
  const app = localizeApp(rawApp);
  const plat = platformLabel(app.core.platform);

  return {
    title: `${app.core.name} 다운로드 바로가기 | SSDown`,
    description: `${app.core.name} ${plat} 버전을 공식 배포처에서 내려받는 방법을 안내합니다.`,
    /*
     * 앱마다 한 장씩 생기는 안내 페이지라 본문이 얇다. 색인 대상이 되면
     * 얇은 페이지가 앱 수만큼 늘어나 상세 페이지의 평가까지 끌어내린다.
     * 색인은 막고 링크는 따라가게 둔다.
     */
    robots: { index: false, follow: true },
  };
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category: categorySlug, id } = await params;

  const rawApp = await getAppById(id);
  if (!rawApp) notFound();
  const app = localizeApp(rawApp);

  const category =
    getCategoryByMain(app.core.category.main) ?? getCategoryBySlug(categorySlug);
  const plat = platformLabel(app.core.platform);
  const license = LICENSE_LABEL_KR[app.download.license] ?? "무료";
  const fileSize = cleanValue(app.download.fileSize);
  const osReq = cleanValue(app.specs.osRequirements);
  const site = app.core.developer.websiteUrl;

  const detailHref = buildAppHref(app);

  const facts: [string, string][] = [
    ["플랫폼", plat],
    ["라이선스", license],
    ...(fileSize ? ([["파일 크기", fileSize]] as [string, string][]) : []),
    ...(osReq ? ([["요구 사양", osReq]] as [string, string][]) : []),
  ];

  return (
    <PageShell
      sidebar={false}
      crumbs={[
        { label: "소프트웨어", href: "/software" },
        ...(category ? [{ label: category.name, href: `/software/${category.slug}` }] : []),
        { label: app.core.name, href: detailHref },
        { label: "다운로드" },
      ]}
    >
      <div className="mx-auto w-full max-w-2xl space-y-2">
        <section className="rounded-[2px] border border-[var(--pt-line)] bg-white p-5 text-center">
          <h1 className="text-[19px] font-extrabold leading-snug tracking-tight">
            {app.core.name} 다운로드
          </h1>

          {/* 간략한 설명 — 상세 페이지와 같은 우리 요약문을 쓴다. */}
          <p className="mx-auto mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--pt-text-sub)]">
            {app.content.shortSummary ||
              `${app.core.name}은(는) ${plat} 환경에서 사용할 수 있는 ${license} 프로그램입니다. 아래 버튼을 눌러 공식 배포처에서 내려받으세요.`}
          </p>

          <dl className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px]">
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <dt className="text-[var(--pt-text-meta)]">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          {site ? (
            <a
              href={site}
              target="_blank"
              rel="nofollow noopener"
              className="mt-4 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-[2px] bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-500"
            >
              <Globe className="h-4 w-4" />
              공식 홈페이지에서 내려받기
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <p className="mt-4 text-[12px] text-[var(--pt-text-meta)]">
              공식 배포처 주소가 확인되지 않았습니다. 검색으로 공식 사이트를 직접 확인해 주세요.
            </p>
          )}

          <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-[var(--pt-text-meta)]">
            <ShieldAlert className="h-3 w-3" />
            SSDown 은 설치 파일을 직접 제공하지 않습니다. 공식 배포처로 이동합니다.
          </p>
        </section>

        <Adsense slotId={AD_SLOT} />

        <div className="rounded-[2px] border border-[var(--pt-line)] bg-white px-4 py-2.5">
          <a
            href={detailHref}
            className="inline-flex items-center gap-1 text-[12px] text-[var(--pt-text-sub)] hover:text-[var(--pt-accent)] hover:underline"
          >
            <ChevronLeft className="h-3 w-3" />
            {app.core.name} 상세 정보로 돌아가기
          </a>
        </div>
      </div>
    </PageShell>
  );
}
