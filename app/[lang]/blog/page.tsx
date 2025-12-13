import { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n-config";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}blog`;

  const title =
    lang === "kr"
      ? "블로그 - SSDown 가이드 및 튜토리얼"
      : "Blog - SSDown Guides & Tutorials";
  const description =
    lang === "kr"
      ? "동영상 다운로드에 대한 포괄적인 가이드와 튜토리얼을 탐색하세요."
      : "Explore comprehensive guides and tutorials about video downloading.";

  return {
    title: `${title} | SSDown`,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: "SSDown Blog",
        },
      ],
      locale: lang === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://ssdown.app/logo.png"],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function BlogPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { lang } = params;

  // 카테고리 필터링
  const selectedCategory = searchParams?.category;
  const allPosts = await getAllPosts();
  const posts = selectedCategory
    ? await getPostsByCategory(selectedCategory)
    : allPosts;

  const getPath = (path: string) => {
    if (lang === "en") return path;
    return `/${lang}${path === "/" ? "" : path}`;
  };

  // 카테고리 목록 추출 (모든 포스트에서)
  const categories = Array.from(
    new Set(allPosts.map((post) => post.category))
  ).filter(Boolean);

  const categoryLabels: Record<string, { en: string; kr: string }> = {
    x: { en: "X (Twitter)", kr: "X (트위터)" },
    tiktok: { en: "TikTok", kr: "TikTok" },
    instagram: { en: "Instagram", kr: "Instagram" },
    facebook: { en: "Facebook", kr: "Facebook" },
    general: { en: "General", kr: "일반" },
  };

  const pageTitle = lang === "kr" ? "블로그" : "Blog";
  const pageDescription =
    lang === "kr"
      ? "동영상 다운로드에 대한 포괄적인 가이드와 튜토리얼을 탐색하세요."
      : "Explore comprehensive guides and tutorials about video downloading.";

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {pageTitle}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {pageDescription}
          </p>
        </header>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3 justify-center">
            <Link
              href={getPath("/blog")}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                !selectedCategory
                  ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {lang === "kr" ? "전체" : "All"}
            </Link>
            {categories.map((category) => {
              const categoryLabel = categoryLabels[category];
              const label =
                (lang === "kr" && categoryLabel?.kr) ||
                categoryLabel?.en ||
                category;
              const isActive = selectedCategory === category;
              return (
                <Link
                  key={category}
                  href={`${getPath("/blog")}?category=${category}`}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                      : "border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                lang={lang}
                getPath={getPath}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">
              {lang === "kr" ? "포스트가 없습니다" : "No Posts Yet"}
            </h2>
            <p className="text-muted-foreground">
              {lang === "kr"
                ? "곧 새로운 가이드와 튜토리얼이 추가될 예정입니다."
                : "New guides and tutorials will be added soon."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
