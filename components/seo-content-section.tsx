"use client";

import { cn } from "@/lib/utils";

interface SeoContentSectionProps {
  title: string;
  content: string[]; // List of paragraphs
  className?: string;
}

export function SeoContentSection({
  title,
  content,
  className,
}: SeoContentSectionProps) {
  if (!content || content.length === 0) return null;

  return (
    <section className={cn("w-full max-w-4xl mx-auto mt-16 px-4", className)}>
      <div className="prose dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
          {title}
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed text-justify">
          {content.map((paragraph, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}
        </div>
      </div>
    </section>
  );
}
