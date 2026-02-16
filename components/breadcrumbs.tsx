import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `https://ssdown.app${item.href}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Visual Breadcrumbs */}
      <ol className="flex items-center text-sm text-muted-foreground flex-wrap">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-muted-foreground/40 shrink-0" />
            )}
            {item.isCurrent ? (
              <span
                className="font-medium text-foreground truncate max-w-[200px] md:max-w-[400px]"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="hover:text-primary hover:underline transition-colors flex items-center gap-1"
              >
                {index === 0 && <Home className="w-3.5 h-3.5" />}
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
