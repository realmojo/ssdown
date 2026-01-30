export const runtime = "edge";
import { Metadata } from "next";

import { notFound } from "next/navigation";
import { PostContent } from "@/components/PostContent";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Calendar, Clock, User } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  // Supabase에서 데이터 가져오기 (실패 시 static posts fallback)
  const { getPostById, getLocalizedContent } = await import("@/lib/blog-utils");
  const post = await getPostById(id);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const title = getLocalizedContent(post.title, lang);
  const excerpt = getLocalizedContent(post.excerpt, lang);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang + "/"}blog/${id}`;

  return {
    title: `${title} | SSDown Blog`,
    description: excerpt,
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
      locale: lang === "kr" ? "ko_KR" : "en_US",
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
    alternates: {
      canonical,
    },
  };
}

export default async function BlogPostPage(props: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;
  // Supabase에서 데이터 가져오기 (실패 시 static posts fallback)
  const { getPostById, getLocalizedContent } = await import("@/lib/blog-utils");
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const title = getLocalizedContent(post.title, lang);
  const content = getLocalizedContent(post.content, lang);
  // en과 kr만 지원, 나머지는 en으로 fallback
  const displayLang = lang === "kr" ? "kr" : "en";
  const locale = displayLang === "kr" ? "ko-KR" : "en-US";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPath = (path: string) => {
    return `/${lang}${path === "/" ? "" : path}`;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <article className="container max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: lang === "kr" ? "홈" : "Home", href: getPath("/") },
            {
              label: lang === "kr" ? "크리에이터 허브" : "Creator Hub",
              href: getPath("/blog"),
            },
            {
              label: title,
              href: getPath(`/blog/${id}`),
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
            {title}
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

        <PostContent content={content} />
      </article>
    </div>
  );
}
