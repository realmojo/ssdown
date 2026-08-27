import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronLeft, ExternalLink, Globe, ShieldAlert } from "lucide-react";
import { getAppById, localizeApp } from "@/lib/app-utils";
import { getCategoryByMain, getCategoryBySlug } from "@/lib/categories";
import { buildAppHref, resolveDistribution } from "@/lib/app-href";
import Adsense from "@/components/Adsense";
import { PageShell } from "@/components/portal/page-shell";
import type { SoftwareApplication } from "@/types/app";

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

/**
 * 광고 아래에 놓을 안내 문장. 앱이 가진 사실만으로 만든다.
 *
 * 광고를 가리키거나 클릭을 유도하는 문구는 넣지 않는다(애드센스 정책).
 * 모든 앱에 같은 문장이 깔리면 그 자체로 얇은 콘텐츠가 되므로, 가진 데이터에
 * 따라 문장이 달라지도록 조합한다.
 */
function downloadNotes(app: SoftwareApplication): string[] {
  const name = app.core.name;
  const plat = platformLabel(app.core.platform);
  const license = app.download.license;
  const notes: string[] = [];

  const categoryName = app.core.category.sub || app.core.category.main;
  notes.push(
    categoryName
      ? `${name}은(는) ${plat} 환경에서 사용하는 ${categoryName} 분야 프로그램입니다.`
      : `${name}은(는) ${plat} 환경에서 사용하는 프로그램입니다.`,
  );

  if (license === "Free") {
    notes.push("비용 없이 내려받아 사용할 수 있습니다.");
  } else if (license === "Open Source") {
    notes.push("오픈소스로 공개되어 있어 소스 코드를 함께 확인할 수 있습니다.");
  } else if (license === "Freemium") {
    notes.push("기본 기능은 무료이며 일부 기능은 유료로 제공됩니다.");
  } else if (license === "Trial") {
    notes.push("체험판이라 사용 기간이나 기능에 제한이 있을 수 있습니다.");
  } else if (license === "Paid") {
    notes.push("유료 프로그램이므로 구매 조건을 개발사 안내에서 확인해 주세요.");
  }

  const osReq = cleanValue(app.specs.osRequirements);
  if (osReq) notes.push(`설치하려면 ${osReq} 환경이 필요합니다.`);

  const fileSize = cleanValue(app.download.fileSize);
  if (fileSize) notes.push(`설치 파일 용량은 약 ${fileSize} 입니다.`);

  const langs = (app.specs.languages ?? []).filter(Boolean);
  if (langs.some((l) => /korean|한국/i.test(l))) {
    notes.push("한국어를 지원합니다.");
  } else if (langs.length) {
    notes.push(`지원 언어: ${langs.slice(0, 5).join(", ")}`);
  }

  const dev = (app.core.developer.name ?? "").trim();
  if (dev && dev !== "Unknown" && !/^More programs\s*\(\d+\)$/.test(dev)) {
    notes.push(`개발사는 ${dev} 입니다.`);
  }

  notes.push("최신 버전과 정확한 배포 조건은 공식 배포처에서 확인하는 것이 안전합니다.");
  return notes;
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
  // 안내할 배포처가 없으면 페이지 자체가 404 다. 메타데이터도 만들지 않는다.
  if (!resolveDistribution(app)) return {};
  const plat = platformLabel(app.core.platform);

  return {
    title: `${app.core.name} 공식 배포처 안내`,
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

  /*
    안내할 배포처가 없으면 이 페이지는 존재할 이유가 없다. 예전에는 "주소가
    확인되지 않았습니다" 문구만 남은 빈 페이지를 그대로 보여줬는데, 다운로드를
    기대하고 들어온 사람에게 아무것도 주지 못하는 페이지였다. 404 로 내보낸다.
    상세 페이지도 같은 판정으로 진입 버튼을 숨기므로 이 페이지로 오는 내부
    링크는 없다.
  */
  const distribution = resolveDistribution(app);
  if (!distribution) notFound();

  const category =
    getCategoryByMain(app.core.category.main) ?? getCategoryBySlug(categorySlug);
  const plat = platformLabel(app.core.platform);
  const license = LICENSE_LABEL_KR[app.download.license] ?? "무료";
  const fileSize = cleanValue(app.download.fileSize);
  const osReq = cleanValue(app.specs.osRequirements);

  const detailHref = buildAppHref(app);
  const notes = downloadNotes(app);

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
          {/*
            이 페이지는 파일을 주는 곳이 아니라 공식 배포처를 안내하는 곳이다.
            제목도 그 사실 그대로 쓴다(상세 페이지의 진입 버튼과 같은 문구).
          */}
          <h1 className="text-[19px] font-extrabold leading-snug tracking-tight">
            {app.core.name} 공식 배포처 안내
          </h1>

          {/* 간략한 설명 — 상세 페이지와 같은 우리 요약문을 쓴다. */}
          <p className="mx-auto mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--pt-text-sub)]">
            {/*
              "아래 버튼" 같은 위치 표현은 쓰지 않는다. 사이에 광고가 놓이면
              광고를 가리키는 말처럼 읽힐 수 있다.
            */}
            {app.content.shortSummary ||
              `${app.core.name}은(는) ${plat} 환경에서 사용할 수 있는 ${license} 프로그램입니다. 공식 배포처에서 내려받을 수 있습니다.`}
          </p>

          <dl className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px]">
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <dt className="text-[var(--pt-text-meta)]">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          {/*
            광고는 버튼 위에 둔다. 위아래를 실선으로 끊어 본문과 구분되게 하고,
            바로 아래에는 앱 자체 정보만 쓴다. 광고를 가리키거나 클릭을 권하는
            문구는 넣지 않는다(애드센스 정책).
          */}
          <div className="my-4 border-y border-[var(--pt-line)] py-4">
            <Adsense slotId={AD_SLOT} />
          </div>

          <ul className="mx-auto max-w-lg space-y-1 text-left text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            {notes.map((n) => (
              <li key={n} className="flex gap-1.5">
                <span className="text-[var(--pt-text-meta)]">·</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>

          {/*
            버튼 문구는 링크의 종류를 따른다. 개발사 홈페이지로 폴백한 경우는
            파일로 바로 가는 주소가 아니라서, 받을 수 있다고 단정하지 않는다.
          */}
          <a
            href={distribution.url}
            target="_blank"
            rel="nofollow noopener"
            className="mt-4 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-[2px] bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-500"
          >
            <Globe className="h-4 w-4" />
            {distribution.kind === "download"
              ? "공식 배포처에서 내려받기"
              : "공식 홈페이지로 이동"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-[var(--pt-text-meta)]">
            <ShieldAlert className="h-3 w-3" />
            SSDown 은 설치 파일을 직접 제공하지 않습니다. 공식 배포처로 이동합니다.
          </p>
        </section>

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
