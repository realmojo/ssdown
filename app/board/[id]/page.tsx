import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, MessageSquare, User } from "lucide-react";
import { PageShell } from "@/components/portal/page-shell";
import { BoardCommentsClient } from "@/components/client/board-comments-client";
import { BoardPostActions } from "@/components/client/board-post-actions";
import { bumpViews, getAdjacent, getComments, getPost } from "@/lib/board-utils";
import { htmlToText } from "@/lib/board-sanitize";
import { buildAlternates } from "@/lib/seo";
import Adsense from "@/components/Adsense";
import { jsonLd } from "@/lib/json-ld";

export const dynamic = "force-dynamic";

/** 애드센스 슬롯 — ssdown(자유게시판). 글 제목 아래 본문 위에 놓는다. */
const POST_TOP_AD_SLOT = "2273945122";

/** 본문이 HTML 이므로 태그를 걷어낸 뒤 잘라 낸다. */
function excerpt(content: string, max = 150): string {
  const flat = htmlToText(content);
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(Number(id));
  if (!post) return { title: "글을 찾을 수 없습니다" };

  const description = excerpt(post.content);
  return {
    title: `${post.title} | 자유게시판`,
    description,
    alternates: buildAlternates(`/board/${post.id}`),
    openGraph: {
      title: post.title,
      description,
      url: `https://ssdown.app/board/${post.id}`,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "article",
    },
  };
}

function fmt(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function BoardPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  const post = await getPost(postId);
  if (!post) notFound();

  const [comments, adjacent] = await Promise.all([
    getComments(postId),
    getAdjacent(post),
  ]);

  // 조회수는 렌더를 막지 않도록 실패해도 무시한다.
  await bumpViews(postId, post.views).catch(() => {});

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    text: excerpt(post.content, 300),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.writer },
    url: `https://ssdown.app/board/${post.id}`,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.commentCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: post.views,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageSchema) }}
      />
      <PageShell
        crumbs={[{ label: "자유게시판", href: "/board" }, { label: post.title }]}
      >
        <article className="pt-panel">
          <header className="border-b border-[var(--pt-line-strong)] px-3 py-2.5">
            <h1 className="text-[17px] font-extrabold leading-snug tracking-tight">
              {post.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--pt-text-meta)]">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {post.writer}
              </span>
              <span>{fmt(post.createdAt)}</span>
              {post.updatedAt !== post.createdAt && <span>(수정됨)</span>}
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {post.commentCount}
              </span>
            </div>
          </header>

          {/* 제목 바로 아래, 본문 위 배너. 높이는 애드센스가 정하게 둔다. */}
          <div className="px-3 pt-3">
            <Adsense slotId={POST_TOP_AD_SLOT} />
          </div>

          {/*
            본문은 HTML 이다. 다만 저장 시점에 lib/board-sanitize 의 허용 목록을
            통과한 값만 들어오므로 스크립트·이벤트 속성은 이미 제거돼 있다.
          */}
          <div
            className="board-content min-h-[120px] break-words px-3 py-3 text-[13px] leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="flex items-center justify-between gap-2 border-t border-[var(--pt-line)] px-3 py-2">
            <a href="/board" className="pt-btn">
              목록
            </a>
            <BoardPostActions postId={post.id} />
          </div>
        </article>

        <Adsense slotId="7759160077" />

        <BoardCommentsClient postId={post.id} comments={comments} />

        {/* 이전·다음 글 */}
        <nav className="pt-panel divide-y divide-[var(--pt-line)]">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className="flex w-14 shrink-0 items-center gap-0.5 text-[11px] text-[var(--pt-text-meta)]">
              <ChevronLeft className="h-3 w-3" />
              이전 글
            </span>
            {adjacent.prev ? (
              <a href={`/board/${adjacent.prev.id}`} className="pt-link truncate text-[12px]">
                {adjacent.prev.title}
              </a>
            ) : (
              <span className="text-[12px] text-[var(--pt-text-meta)]">없습니다</span>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className="flex w-14 shrink-0 items-center gap-0.5 text-[11px] text-[var(--pt-text-meta)]">
              <ChevronRight className="h-3 w-3" />
              다음 글
            </span>
            {adjacent.next ? (
              <a href={`/board/${adjacent.next.id}`} className="pt-link truncate text-[12px]">
                {adjacent.next.title}
              </a>
            ) : (
              <span className="text-[12px] text-[var(--pt-text-meta)]">없습니다</span>
            )}
          </div>
        </nav>
      </PageShell>
    </>
  );
}
