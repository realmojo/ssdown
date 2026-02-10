import { Metadata } from "next";

import { PostCard } from "@/components/PostCard";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Post } from "@/lib/blog-utils";
import { Key } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/blog`;

  const title = "Video Download Guides & Tutorials";
  const description =
    "Expert guides on downloading videos from TikTok, Instagram, X, Facebook. Learn video formats, security tips, and creator strategies.";

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
      locale: "en_US",
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

import { getAllPosts, getPostsByCategory } from "@/lib/blog-utils";

export default async function BlogPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;

  const selectedCategory = searchParams?.category;
  const allPosts = await getAllPosts();
  const posts = selectedCategory
    ? await getPostsByCategory(selectedCategory)
    : allPosts;

  // 카테고리 목록 추출 (모든 포스트에서)
  const categories = Array.from(
    new Set(allPosts.map((post: any | Post) => post.category)),
  ).filter(Boolean);

  const categoryLabels: Record<string, string> = {
    guide: "Guide",
    tech: "Tech",
    security: "Security",
    strategy: "Strategy",
    tips: "Tips",
    trends: "Trends",
    instagram: "Instagram",
    general: "General",
  };

  const pageTitle = "Creator Hub";
  const pageDescription =
    "Expert guides on downloading videos from TikTok, Instagram, X, Facebook. Learn video formats, security tips, and creator strategies.";

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            {
              label: "Creator Hub",
              href: "/blog",
              isCurrent: true,
            },
          ]}
        />

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
              href="/blog"
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                !selectedCategory
                  ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                  : "border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              All
            </Link>
            {categories.map((category) => {
              const label =
                categoryLabels[category as keyof typeof categoryLabels] ||
                category;
              const isActive = selectedCategory === category;
              return (
                <Link
                  key={category as Key}
                  href={`/blog?category=${category as string}`}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                      : "border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {label as string}
                </Link>
              );
            })}
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {posts.map((post: any | Post) => (
              <PostCard
                key={post.id}
                post={post}
                lang="en" // Hardcoded to 'en'
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Posts Yet</h2>
            <p className="text-muted-foreground">
              New guides and tutorials will be added soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
