import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Post } from "@/lib/posts";

interface PostCardProps {
  post: Post;
  lang?: string; // Optional or ignored now
  getPath?: (path: string) => string; // Optional or ignored now
}

export function PostCard({ post }: PostCardProps) {
  // Always use English content (assuming post has localized content structure, or just use English fields directly if they exist)
  // Check stricture of Post in lib/posts
  // Assuming getLocalizedContent is no longer needed if we just want 'en' or direct access.
  // Actually, let's keep it simple. If post.title is string, use it. If it's object (en/kr), use 'en'.

  // Helper to safely get English content
  const getContent = (content: Record<string, string> | string) => {
    if (typeof content === "string") return content;
    return content.en || Object.values(content)[0] || "";
  };

  const title = getContent(post.title);
  const excerpt = getContent(post.excerpt);

  const locale = "en-US";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800">
      <Link href={`/blog/${post.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedAt)}</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4" />
            <span>{post.readTime} min read</span>
          </div>
          <h3 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3 mb-4">{excerpt}</p>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
            <span>Read more</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
