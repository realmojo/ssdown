import { Metadata } from "next";
import { PageShell } from "@/components/portal/page-shell";
import { BoardWriteClient } from "@/components/client/board-write-client";
import { buildAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "글쓰기 | 자유게시판 | SSDown",
  description: "SSDown 자유게시판에 새 글을 남깁니다.",
  // 입력 화면은 색인 대상이 아니다.
  robots: { index: false, follow: true },
  alternates: buildAlternates("/board/write"),
};

export default function BoardWritePage() {
  return (
    <PageShell
      crumbs={[{ label: "자유게시판", href: "/board" }, { label: "글쓰기" }]}
      title="글쓰기"
      desc="가입 없이 닉네임과 비밀번호만으로 글을 남길 수 있습니다."
    >
      <BoardWriteClient />
    </PageShell>
  );
}
