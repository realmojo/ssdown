import Link from "next/link";
import { Panel } from "./panel";
import { BoardTable, type BoardRow } from "./board-table";
import { RankList } from "./rank-list";
import { PortalSidebar } from "./portal-sidebar";
import {
  ALL_TOOLS,
  DOWNLOADER_ITEMS,
  PLATFORM_ITEMS,
  TOOL_GROUPS,
} from "@/lib/portal-nav";
import type { SoftwareApplication } from "@/types/app";
import type { Post } from "@/lib/blog-utils";
import { blogCategoryLabel, isKoreanPost } from "@/lib/blog-categories";
import Adsense from "@/components/Adsense";
import type { BoardPost } from "@/lib/board-utils";

/** 메인 상단 배너 광고 슬롯. */
const HOME_AD_SLOT = "2367791384";

/**
 * 홈에서 "인기 도구"로 노출할 순서. 트래픽이 많은 도구를 앞에 둔다.
 * ALL_TOOLS에 없는 경로는 조용히 빠지므로 실제 라우트와 일치해야 한다.
 */
const POPULAR_HREFS = [
  "/image/image-compressor",
  "/pdf/merge-pdf",
  "/video-audio/video-to-mp3",
  "/image/background-remover",
  "/pdf/pdf-to-jpg",
  "/utility/qr-code-generator",
  "/image/social-image-resizer",
  "/video-audio/video-compressor",
  "/file/csv-to-excel",
  "/utility/password-generator",
];

/** ISO 문자열 또는 Date를 `26.01.24` 형태로 줄인다. */
function fmtDate(v?: string | Date): string {
  if (!v) return "";
  const iso = typeof v === "string" ? v : v.toISOString();
  return iso.slice(2, 10).replace(/-/g, ".");
}

export function HomePortal({
  apps,
  posts,
  boardPosts,
}: {
  apps: SoftwareApplication[];
  posts: Post[];
  boardPosts: BoardPost[];
}) {
  const popular = POPULAR_HREFS.map((h) => ALL_TOOLS.find((t) => t.href === h)).filter(
    (t): t is (typeof ALL_TOOLS)[number] => Boolean(t),
  );

  const softwareRows: BoardRow[] = apps.slice(0, 12).map((a, i) => ({
    no: i + 1,
    href: `/software/${a.core.platform.toLowerCase().replace("ios", "iphone")}/${a.core.slug}`,
    title: a.core.name,
    category: a.core.platform === "iOS" ? "iPhone" : a.core.platform,
    badge: i < 2 ? "new" : undefined,
    meta1: a.download.license === "Free" ? "무료" : a.download.license,
    meta2: fmtDate(a.specs.lastUpdatedDate),
  }));

  // 아직 번역되지 않은(영문) 글은 사이트맵과 동일한 기준으로 홈에서도 감춘다.
  const postRows: BoardRow[] = posts
    .map((p) => ({ ...p, title: String(p.title) }))
    .filter((p) => isKoreanPost(p.title))
    .slice(0, 12)
    .map((p, i) => ({
      no: i + 1,
      href: `/blog/${p.id}`,
      title: p.title,
      category: blogCategoryLabel(p.category),
      badge: i < 2 ? ("new" as const) : undefined,
      meta1: fmtDate(p.publishedAt),
    }));

  return (
    <div className="pt-wrap flex gap-2 py-2">
      <PortalSidebar />

      <div className="min-w-0 flex-1 space-y-2">
        {/* 헤드라인 — 배너 대신 한 줄 소개 + 바로가기 */}
        <section className="pt-panel flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[15px] font-extrabold leading-tight">
              설치 없이 브라우저에서 바로 쓰는 무료 도구 {ALL_TOOLS.length}종
            </h1>
            <p className="mt-0.5 text-[12px] text-[var(--pt-text-sub)]">
              이미지·PDF·영상 변환부터 영상 다운로드, 소프트웨어 정보까지 한곳에서.
              파일은 기기를 벗어나지 않고 회원가입도 필요 없습니다.
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Link href="/tools" className="pt-btn pt-btn-primary">
              전체 도구 보기
            </Link>
            <Link href="/software" className="pt-btn">
              소프트웨어
            </Link>
          </div>
        </section>

        {/* 상단 배너 광고 — 높이는 애드센스가 정하게 둔다 */}
        <Adsense slotId={HOME_AD_SLOT} />

        {/* 인기 도구 + 영상 다운로드 */}
        <div className="grid gap-2 md:grid-cols-2">
          <Panel title="인기 도구" moreHref="/tools">
            <RankList items={popular} />
          </Panel>

          <Panel title="영상 다운로드" moreHref="/tools">
            <ul>
              {DOWNLOADER_ITEMS.map((it) => (
                <li key={it.href} className="border-b border-[var(--pt-line)] last:border-0">
                  <Link
                    href={it.href}
                    className="pt-link flex items-baseline gap-1.5 truncate py-[6px] text-[12px]"
                  >
                    <span className="font-semibold">{it.label}</span>
                    <span className="text-[11px] text-[var(--pt-text-meta)]">
                      영상·이미지 무손실 다운로드
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* 최신 소프트웨어 + 최신 글 */}
        <div className="grid gap-2 md:grid-cols-2">
          <Panel title="새로 등록된 소프트웨어" moreHref="/software" flush>
            <BoardTable rows={softwareRows} headers={["번호", "이름", "구분", "갱신"]} />
          </Panel>

          <Panel title="최신 글" moreHref="/blog" flush>
            <BoardTable rows={postRows} headers={["번호", "제목", "날짜"]} />
          </Panel>
        </div>

        {/* 자유게시판 */}
        <Panel title="자유게시판" moreHref="/board" flush>
          <BoardTable
            rows={boardPosts.slice(0, 8).map((p, i) => ({
              no: i + 1,
              href: `/board/${p.id}`,
              title: p.title,
              meta1: p.writer,
              meta2: fmtDate(p.createdAt),
            }))}
            headers={["번호", "제목", "글쓴이", "날짜"]}
          />
        </Panel>

        {/* 카테고리별 전체 도구 — 내부 링크를 한 화면에 모두 노출한다 */}
        <Panel title={`전체 도구 ${ALL_TOOLS.length}종`} moreHref="/tools">
          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_GROUPS.map((g) => (
              <div key={g.key}>
                <Link
                  href={g.hub}
                  className="mb-1 flex items-center justify-between border-b border-[var(--pt-line)] pb-1 text-[12px] font-bold hover:text-[var(--pt-accent)]"
                >
                  <span>{g.label}</span>
                  <span className="text-[11px] font-normal text-[var(--pt-text-meta)]">
                    {g.items.length}
                  </span>
                </Link>
                <ul>
                  {g.items.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className="pt-link block truncate py-[2px] text-[12px] text-[var(--pt-text-sub)]"
                      >
                        · {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        {/* 플랫폼별 소프트웨어 */}
        <Panel title="플랫폼별 소프트웨어">
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {PLATFORM_ITEMS.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="block border border-[var(--pt-line)] py-2 text-center text-[12px] font-semibold hover:border-[var(--pt-accent)] hover:text-[var(--pt-accent)]"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
