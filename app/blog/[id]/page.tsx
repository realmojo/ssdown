import { Metadata } from "next";

import { notFound } from "next/navigation";
import { PostContent } from "@/components/PostContent";
import { PageShell } from "@/components/portal/page-shell";
import { blogCategoryLabel } from "@/lib/blog-categories";
import { Calendar, Clock, User } from "lucide-react";
import { buildAlternates } from "@/lib/seo";
import Adsense from "@/components/Adsense";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { getPostById } = await import("@/lib/blog-utils");
  const post = await getPostById(id);

  if (!post) {
    return {
      title: "글을 찾을 수 없습니다",
    };
  }

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/blog/${id}`;

  const title = String(post.title);
  const excerpt = String(post.excerpt);

  // 한국어 전용 사이트이므로 아직 번역되지 않은 영문 글은 색인에서 제외한다.
  const indexable = /[가-힣]/.test(title);

  return {
    title: `${title} | 블로그`,
    description: excerpt,
    robots: { index: indexable, follow: true },
    openGraph: {
      title,
      description: excerpt,
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: post.image.startsWith("http")
            ? post.image
            : `${baseUrl}${post.image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "ko_KR",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
      images: [
        post.image.startsWith("http") ? post.image : `${baseUrl}${post.image}`,
      ],
    },
    alternates: buildAlternates(`/blog/${id}`),
  };
}

import { getPostById } from "@/lib/blog-utils";
import { jsonLd } from "@/lib/json-ld";

export default async function BlogPostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const rawPost = await getPostById(id);

  if (!rawPost) {
    notFound();
  }

  const post = {
    ...rawPost,
    title: String(rawPost.title),
    excerpt: String(rawPost.excerpt),
    content: String(rawPost.content),
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const baseUrl = "https://ssdown.app";
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image.startsWith("http")
      ? post.image
      : `${baseUrl}${post.image}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
      sameAs: "https://ssdown.app/blog",
    },
    publisher: {
      "@type": "Organization",
      name: "SSDown",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageSchema) }}
      />
      <PageShell
        crumbs={[
          { label: "크리에이터 허브", href: "/blog" },
          { label: String(post.title) },
        ]}
      >
        <article className="pt-panel px-3 py-3">
          {/* 게시글 머리말 — 제목 + 작성 정보 한 줄 */}
          <header className="mb-2 border-b border-[var(--pt-line-strong)] pb-2">
            <h1 className="text-[19px] font-extrabold leading-snug tracking-tight">
              {post.title}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--pt-text-meta)]">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                읽는 데 {post.readTime}분
              </span>
              <span className="pt-badge">{blogCategoryLabel(post.category)}</span>
            </div>
            {post.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="pt-badge">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <Adsense slotId="7759160077" />

          <PostContent content={post.content} />

          <div className="mt-3 border-t border-[var(--pt-line)] pt-2">
            <a href="/blog" className="pt-btn">
              목록으로
            </a>
          </div>
        </article>
      </PageShell>
    </>
  );
}
