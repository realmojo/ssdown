import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

interface SiteFooterProps {
  dict: any;
  lang: string;
}

export function SiteFooter({ dict, lang }: SiteFooterProps) {
  const getPath = (path: string) => {
    if (lang === "en") return path;
    return `/${lang}${path}`;
  };

  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur-sm py-6">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6 text-sm text-muted-foreground">
        <p>&copy; 2024 SSDown. All rights reserved.</p>
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link
            href={getPath("/privacy")}
            className="hover:text-primary transition-colors"
          >
            {dict.privacy || "Privacy Policy"}
          </Link>
          <Link
            href={getPath("/terms")}
            className="hover:text-primary transition-colors"
          >
            {dict.terms || "Terms of Service"}
          </Link>
          <Link
            href={getPath("/about")}
            className="hover:text-primary transition-colors"
          >
            {dict.about?.nav || dict.nav?.about || "About Us"}
          </Link>
          <Link
            href={getPath("/contact")}
            className="hover:text-primary transition-colors"
          >
            {dict.contact?.nav || dict.nav?.contact || "Contact"}
          </Link>
          {/* 모바일만 footer에 표시 */}
          <div className="md:hidden">
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
