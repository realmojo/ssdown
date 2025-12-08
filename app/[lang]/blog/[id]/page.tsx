import { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n-config";
import { getAllPosts, getLocalizedContent } from "@/lib/posts";
import { notFound } from "next/navigation";
import { PostContent } from "@/components/PostContent";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Post } from "@/lib/posts";

// API를 통해 포스트 가져오기
async function getPostById(id: string): Promise<Post | null> {
  try {
    // 서버 사이드에서 내부 API 호출
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const apiUrl = `${baseUrl}/api/blog/${id}`;
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success || !result.data) {
      return null;
    }

    return result.data as Post;
  } catch (error) {
    console.error("Error fetching post from API:", error);
    return null;
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const params: { lang: string; id: string }[] = [];

  i18n.locales.forEach((lang) => {
    posts.forEach((post) => {
      params.push({ lang, id: post.id });
    });
  });

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const title = getLocalizedContent(post.title, lang);
  const excerpt = getLocalizedContent(post.excerpt, lang);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}blog/${id}`;

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
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;
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
    if (lang === "en") return path;
    return `/${lang}${path === "/" ? "" : path}`;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <article className="container max-w-4xl mx-auto px-4 py-12">
        <Link
          href={getPath("/")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

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

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <PostContent content={content} />
        </div>
      </article>
    </div>
  );
}
