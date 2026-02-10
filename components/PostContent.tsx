"use client";

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
