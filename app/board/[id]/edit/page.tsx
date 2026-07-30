import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/portal/page-shell";
import { BoardWriteClient } from "@/components/client/board-write-client";
import { getPost } from "@/lib/board-utils";
import { buildAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "글 수정 | 자유게시판 | SSDown",
  // 입력 화면은 색인 대상이 아니다.
  robots: { index: false, follow: false },
  alternates: buildAlternates("/board"),
};

/**
 * 수정 화면.
 *
 * 본문은 이미 공개된 내용이므로 미리 채워 두고, 실제 반영은 비밀번호가 맞을 때만
 * 서버(PUT /api/board/[id])에서 이뤄진다.
 */
export default async function BoardEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  const post = await getPost(postId);
  if (!post) notFound();

  return (
    <PageShell
      crumbs={[
        { label: "자유게시판", href: "/board" },
        { label: post.title, href: `/board/${post.id}` },
        { label: "수정" },
      ]}
      title="글 수정"
      desc="글을 쓸 때 정한 비밀번호를 입력해야 수정됩니다."
    >
      <BoardWriteClient
        postId={post.id}
        initialTitle={post.title}
        initialContent={post.content}
        initialWriter={post.writer}
      />
    </PageShell>
  );
}
