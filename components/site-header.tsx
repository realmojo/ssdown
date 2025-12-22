"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { ModeToggle } from "@/components/mode-toggle";

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
  else if (pathname?.endsWith("/bilibili")) currentPage = "bilibili";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <a
          href="/"
          target="_self"
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
        </a>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-4 text-sm font-medium"
          aria-label="Main navigation"
        >
          <a href={getPath("/x")} target="_self">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.twitter || "X (Twitter)"}
            </Button>
          </a>
          <a href={getPath("/tiktok")} target="_self">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.tiktok || "TikTok"}
            </Button>
          </a>
          <a href={getPath("/instagram")} target="_self">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.instagram?.nav || "Instagram"}
            </Button>
          </a>
          <a href={getPath("/facebook")} target="_self">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.facebook?.nav || "Facebook"}
            </Button>
          </a>
          <a href={getPath("/dailymotion")} target="_self">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.dailymotion?.nav || "Dailymotion"}
            </Button>
          </a>
          <a href={getPath("/9gag")} target="_self">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.["9gag"]?.nav || "9GAG"}
            </Button>
          </a>
          <a href={getPath("/bilibili")} target="_self">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              {dict?.bilibili?.nav || "Bilibili"}
            </Button>
          </a>
          <a href={getPath("/blog")} target="_self">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              Blog
            </Button>
          </a>
        </nav>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex-1 mr-4" aria-label="Mobile navigation">
          <select
            value={currentPage}
            onChange={(e) => handleNavChange(e.target.value)}
            className="w-full bg-transparent border-0 focus:ring-0 px-2 font-medium text-sm rounded-md cursor-pointer focus:outline-none"
          >
            <option value="home">{dict?.home || "Home"}</option>
            <option value="x">{dict?.twitter || "X (Twitter)"}</option>
            <option value="tiktok">{dict?.tiktok || "TikTok"}</option>
            <option value="instagram">{dict?.instagram || "Instagram"}</option>
            <option value="facebook">{dict?.facebook || "Facebook"}</option>
            <option value="dailymotion">
              {dict?.dailymotion?.nav || "Dailymotion"}
            </option>
            <option value="9gag">{dict?.["9gag"] || "9GAG"}</option>
            <option value="bilibili">
              {dict?.bilibili?.nav || "Bilibili"}
            </option>
            <option value="blog">Blog</option>
          </select>
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
