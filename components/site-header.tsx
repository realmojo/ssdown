"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SiteHeaderProps {
  dict: any;
  lang: string;
}

export function SiteHeader({ dict, lang }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getPath = (path: string) => {
    if (lang === "en") return path;
    return `/${lang}${path === "/" ? "" : path}`;
  };

  const handleNavChange = (value: string) => {
    const path = value === "home" ? "/" : `/${value}`;
    router.push(getPath(path));
  };

  // Determine current active page for Select value
  let currentPage = "home";
  if (pathname?.endsWith("/x")) currentPage = "x";
  else if (pathname?.endsWith("/tiktok")) currentPage = "tiktok";
  else if (pathname?.endsWith("/instagram")) currentPage = "instagram";
  else if (pathname?.endsWith("/facebook")) currentPage = "facebook";
  else if (pathname?.endsWith("/dailymotion")) currentPage = "dailymotion";
  else if (pathname?.endsWith("/9gag")) currentPage = "9gag";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link
          href={getPath("/")}
          className="flex items-center gap-2 font-bold text-xl mr-6 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.png"
            alt="SSDown Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
            unoptimized
          />
          <span className="hidden md:inline bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            SSDown
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-4 text-sm font-medium"
          aria-label="Main navigation"
        >
          <Link href={getPath("/x")}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.twitter || "X (Twitter)"}
            </Button>
          </Link>
          <Link href={getPath("/tiktok")}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.tiktok || "TikTok"}
            </Button>
          </Link>
          <Link href={getPath("/instagram")}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.instagram?.nav || "Instagram"}
            </Button>
          </Link>
          <Link href={getPath("/facebook")}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.facebook?.nav || "Facebook"}
            </Button>
          </Link>
          <Link href={getPath("/dailymotion")}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.dailymotion?.nav || "Dailymotion"}
            </Button>
          </Link>
          <Link href={getPath("/9gag")}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.["9gag"]?.nav || "9GAG"}
            </Button>
          </Link>
          <Link href={getPath("/blog")}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              Blog
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex-1 mr-4" aria-label="Mobile navigation">
          <Select value={currentPage} onValueChange={handleNavChange}>
            <SelectTrigger className="w-full bg-transparent border-0 focus:ring-0 px-2 font-medium">
              <SelectValue placeholder="Menu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">{dict?.home || "Home"}</SelectItem>
              <SelectItem value="x">
                {dict?.twitter || "X (Twitter)"}
              </SelectItem>
              <SelectItem value="tiktok">{dict?.tiktok || "TikTok"}</SelectItem>
              <SelectItem value="instagram">
                {dict?.instagram || "Instagram"}
              </SelectItem>
              <SelectItem value="facebook">
                {dict?.facebook || "Facebook"}
              </SelectItem>
              <SelectItem value="dailymotion">
                {dict?.dailymotion?.nav || "Dailymotion"}
              </SelectItem>
              <SelectItem value="9gag">
                {dict?.["9gag"] || "9GAG"}
              </SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
            </SelectContent>
          </Select>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSelector currentLang={lang} />
          {/* PC만 상단에 표시 */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
