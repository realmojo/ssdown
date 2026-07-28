import { Metadata } from "next";

import { notFound } from "next/navigation";
import { PostContent } from "@/components/PostContent";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
    title: `${title} | SSDown 블로그`,
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
  const jsonLd = {
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="container max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            {
              label: "크리에이터 허브",
              href: "/blog",
            },
            {
              label: post.title,
              href: `/blog/${id}`,
              isCurrent: true,
            },
          ]}
        />

        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>
        <Adsense slotId="7759160077" />

        <PostContent content={post.content} />
      </article>
    </div>
  );
}
