"use client";

import { PostCard } from "./PostCard";
import { Post } from "@/lib/posts";
import { BookOpen } from "lucide-react";

interface PostSectionProps {
  posts: Post[];
  lang: string;
  category?: string;
  title?: string;
  getPath: (path: string) => string;
}

export function PostSection({
  posts,
  lang,
  category,
  title,
  getPath,
}: PostSectionProps) {
  if (posts.length === 0) return null;

  const sectionTitle =
    title ||
    (category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Guides`
      : "Latest Guides");

  return (
    <section className="w-full max-w-6xl mx-auto mt-20 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
          <BookOpen className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {sectionTitle}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {lang === "en"
            ? "Explore our comprehensive guides and tutorials to get the most out of video downloading."
            : lang === "kr"
            ? "동영상 다운로드를 최대한 활용하기 위한 포괄적인 가이드와 튜토리얼을 탐색해보세요."
            : "動画ダウンロードを最大限に活用するための包括的なガイドとチュートリアルを探索してください。"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} lang={lang} getPath={getPath} />
        ))}
      </div>
    </section>
  );
}
