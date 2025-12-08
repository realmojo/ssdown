"use client";

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  // HTML content renderer with proper styling
  return (
    <div
      className="post-content max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        // Base styles
        fontSize: "1.125rem",
        lineHeight: "1.75rem",
        color: "rgb(55, 65, 81)",
      }}
    />
  );
}
