"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface SiteHeaderProps {
  dict: any;
}

export function SiteHeader({ dict }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavChange = (value: string) => {
    const path = value === "home" ? "/" : `/${value}`;
    router.push(path);
  };

  // Determine current active page for Select value
  let currentPage = "home";
  if (pathname?.endsWith("/x")) currentPage = "x";
  else if (pathname?.endsWith("/tiktok")) currentPage = "tiktok";
  else if (pathname?.endsWith("/instagram")) currentPage = "instagram";
  else if (pathname?.endsWith("/facebook")) currentPage = "facebook";
  else if (pathname?.endsWith("/dailymotion")) currentPage = "dailymotion";
  else if (pathname?.endsWith("/9gag")) currentPage = "9gag";
  else if (pathname?.endsWith("/yt/thumbnail")) currentPage = "yt/thumbnail";
  else if (pathname?.endsWith("/yt/preview")) currentPage = "yt/preview";
  else if (pathname?.endsWith("/blog")) currentPage = "blog";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl mr-6 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.png"
            alt="SSDown Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary data-[state=open]:text-primary"
              >
                Platform Tools <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/x" className="w-full cursor-pointer">
                  {dict?.twitter || "X (Twitter)"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tiktok" className="w-full cursor-pointer">
                  {dict?.tiktok || "TikTok"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/instagram" className="w-full cursor-pointer">
                  {dict?.instagram?.nav || "Instagram"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/facebook" className="w-full cursor-pointer">
                  {dict?.facebook?.nav || "Facebook"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dailymotion" className="w-full cursor-pointer">
                  {dict?.dailymotion?.nav || "Dailymotion"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/9gag" className="w-full cursor-pointer">
                  {dict?.["9gag"]?.nav || "9GAG"}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary data-[state=open]:text-primary"
              >
                Youtube <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/yt/thumbnail" className="w-full cursor-pointer">
                  Thumbnail Analysis
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/yt/preview" className="w-full cursor-pointer">
                  Edit Preview
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/blog">
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
            <SelectTrigger
              className="w-full bg-transparent border-0 focus:ring-0 px-2 font-medium"
              aria-label="Navigation menu"
            >
              <SelectValue placeholder="Menu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">{dict?.home || "Home"}</SelectItem>
              <SelectGroup>
                <SelectLabel>Platform Tools</SelectLabel>
                <SelectItem value="x">
                  {dict?.twitter || "X (Twitter)"}
                </SelectItem>
                <SelectItem value="tiktok">
                  {dict?.tiktok || "TikTok"}
                </SelectItem>
                <SelectItem value="instagram">
                  {dict?.instagram?.nav || "Instagram"}
                </SelectItem>
                <SelectItem value="facebook">
                  {dict?.facebook?.nav || "Facebook"}
                </SelectItem>
                <SelectItem value="dailymotion">
                  {dict?.dailymotion?.nav || "Dailymotion"}
                </SelectItem>
                <SelectItem value="9gag">
                  {dict?.["9gag"]?.nav || "9GAG"}
                </SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Youtube</SelectLabel>
                <SelectItem value="yt/thumbnail">Thumbnail Analysis</SelectItem>
                <SelectItem value="yt/preview">Priview Editor</SelectItem>
              </SelectGroup>
              <SelectItem value="blog">Blog</SelectItem>
            </SelectContent>
          </Select>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* PC만 상단에 표시 */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
