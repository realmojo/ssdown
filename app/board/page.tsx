import { Metadata } from "next";
import { PageShell } from "@/components/portal/page-shell";
import { Panel } from "@/components/portal/panel";
import { BoardPager } from "@/components/client/board-pager";
import { BoardSearch } from "@/components/client/board-search";
import { getPosts, PAGE_SIZE } from "@/lib/board-utils";
import { buildAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

const TITLE = "자유게시판";
const DESC = "도구 사용 후기, 질문, 잡담을 자유롭게 남겨 주세요. 가입 없이 닉네임과 비밀번호만으로 쓸 수 있습니다.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${TITLE} | SSDown`,
    description: DESC,
    alternates: buildAlternates("/board"),
    openGraph: {
      title: `${TITLE} | SSDown`,
      description: DESC,
      url: "https://ssdown.app/board",
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
    },
  };
}

/** `26.07.30` 또는 오늘 글이면 `14:32`. */
function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return d.toISOString().slice(2, 10).replace(/-/g, ".");
}

/** 등록한 지 24시간이 지나지 않은 글에 N 표시를 붙인다. */
function isNew(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 86_400_000;
}

export default async function BoardPage(props: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await props.searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const q = sp.q?.trim() ?? "";

  const { posts, total } = await getPosts({ page, q });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // 최신 글이 가장 큰 번호를 갖도록 역순으로 매긴다.
  const startNo = total - (page - 1) * PAGE_SIZE;

  return (
    <PageShell
      crumbs={[{ label: TITLE }]}
      title={TITLE}
      desc={DESC}
      actions={
        <a href="/board/write" className="pt-btn pt-btn-primary">
          글쓰기
        </a>
      }
    >
      <Panel
        title={q ? `"${q}" 검색 결과 ${total.toLocaleString()}건` : `전체 ${total.toLocaleString()}건`}
        right={<BoardSearch initialQ={q} />}
        flush
      >
        <div className="overflow-x-auto">
          <table className="pt-table">
            <thead>
              {/* 좁은 화면에서는 제목이 눌리지 않도록 글쓴이·조회 칸을 접는다 */}
              <tr>
                <th className="pt-td-num">번호</th>
                <th className="text-left">제목</th>
                <th className="pt-td-meta hidden sm:table-cell">글쓴이</th>
                <th className="pt-td-meta">날짜</th>
                <th className="pt-td-meta hidden sm:table-cell">조회</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p.id}>
                  <td className="pt-td-num">
                    {p.isNotice ? (
                      <span className="pt-badge pt-badge-hot">공지</span>
                    ) : (
                      startNo - i
                    )}
                  </td>
                  <td className="max-w-0">
                    <a
                      href={`/board/${p.id}`}
                      className="pt-link flex items-center gap-1"
                    >
                      <span className="truncate">{p.title}</span>
                      {p.commentCount > 0 && (
                        <span className="shrink-0 font-bold text-[var(--pt-hot)]">
                          [{p.commentCount}]
                        </span>
                      )}
                      {isNew(p.createdAt) && (
                        <span className="pt-badge pt-badge-new shrink-0">N</span>
                      )}
                    </a>
                  </td>
                  <td className="pt-td-meta hidden truncate sm:table-cell">{p.writer}</td>
                  <td className="pt-td-meta">{fmtDate(p.createdAt)}</td>
                  <td className="pt-td-meta hidden sm:table-cell">
                    {p.views.toLocaleString()}
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="!h-24 text-center text-[var(--pt-text-meta)]">
                    {q ? "검색 결과가 없습니다." : "첫 글을 남겨 보세요."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex items-center justify-between gap-2">
        <BoardPager currentPage={page} totalPages={totalPages} q={q} />
        <a href="/board/write" className="pt-btn pt-btn-primary shrink-0">
          글쓰기
        </a>
      </div>
    </PageShell>
  );
}
