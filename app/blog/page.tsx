import { Metadata } from "next";

import { Post } from "@/lib/blog-utils";
import { getAllPosts, getPostsByCategory } from "@/lib/blog-utils";
import { blogCategoryLabel, isKoreanPost } from "@/lib/blog-categories";
import { buildAlternates } from "@/lib/seo";
import { PageShell } from "@/components/portal/page-shell";
import { Panel } from "@/components/portal/panel";
import { BoardTable, type BoardRow } from "@/components/portal/board-table";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "크리에이터 허브";
const PAGE_DESC =
  "SSDown 무료 온라인 도구를 200% 활용하는 팁과 튜토리얼, 가이드입니다.";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = "https://ssdown.app/blog";
  const title = "블로그 & 튜토리얼";
  const description =
    "SSDown 무료 온라인 도구를 200% 활용하는 팁과 튜토리얼, 가이드. 이미지 편집, PDF 관리, 영상 변환 등을 배워 보세요.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      images: [
        { url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: "SSDown 블로그" },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://ssdown.app/logo.png"],
    },
    alternates: buildAlternates("/blog"),
  };
}

function fmtDate(v?: string | Date): string {
  if (!v) return "";
  const iso = typeof v === "string" ? v : v.toISOString();
  return iso.slice(2, 10).replace(/-/g, ".");
}

export default async function BlogPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const selectedCategory = searchParams?.category;

  const allPosts: Post[] = await getAllPosts();
  const raw: Post[] = selectedCategory
    ? await getPostsByCategory(selectedCategory)
    : allPosts;

  // 한국어 글만 노출한다. 기준은 사이트맵과 동일하다.
  const posts = raw.filter((p) => isKoreanPost(p.title));

  // 분류 탭은 한국어 글이 하나라도 있는 분류만 보여준다.
  const koreanAll = allPosts.filter((p) => isKoreanPost(p.title));
  const counts: Record<string, number> = {};
  for (const p of koreanAll) {
    if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  const categories = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const rows: BoardRow[] = posts.map((p, i) => ({
    no: posts.length - i,
    href: `/blog/${p.id}`,
    title: String(p.title),
    category: blogCategoryLabel(p.category),
    badge: i < 3 ? "new" : undefined,
    meta1: fmtDate(p.publishedAt),
    meta2: `${p.readTime ?? 5}분`,
  }));

  return (
    <PageShell
      crumbs={[{ label: PAGE_TITLE }]}
      title={PAGE_TITLE}
      desc={PAGE_DESC}
      actions={
        <span className="text-[12px] text-[var(--pt-text-meta)]">
          총 <strong className="text-[var(--pt-accent)]">{koreanAll.length}</strong>편
        </span>
      }
    >
      {/* 분류 탭 */}
      <nav className="flex flex-wrap items-center gap-1 border-b border-[var(--pt-line)] pb-2">
        <a
          href="/blog"
          className={`px-2 py-1 text-[12px] ${
            !selectedCategory
              ? "font-bold text-[var(--pt-accent)]"
              : "text-[var(--pt-text-sub)] hover:text-[var(--pt-accent)]"
          }`}
        >
          전체 <span className="text-[11px] text-[var(--pt-text-meta)]">{koreanAll.length}</span>
        </a>
        {categories.map(([cat, n]) => (
          <a
            key={cat}
            href={`/blog?category=${cat}`}
            className={`px-2 py-1 text-[12px] ${
              selectedCategory === cat
                ? "font-bold text-[var(--pt-accent)]"
                : "text-[var(--pt-text-sub)] hover:text-[var(--pt-accent)]"
            }`}
          >
            {blogCategoryLabel(cat)}{" "}
            <span className="text-[11px] text-[var(--pt-text-meta)]">{n}</span>
          </a>
        ))}
      </nav>

      <Panel
        title={selectedCategory ? `${blogCategoryLabel(selectedCategory)} 글` : "전체 글"}
        flush
      >
        <BoardTable rows={rows} headers={["번호", "제목", "작성일", "읽기"]} />
      </Panel>
    </PageShell>
  );
}
