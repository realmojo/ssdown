import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { ModeToggle } from "@/components/mode-toggle"

interface SiteHeaderProps {
  dict: any
  lang: string
}

export function SiteHeader({ dict, lang }: SiteHeaderProps) {
  const getPath = (path: string) => {
    if (lang === 'en') return path
    return `/${lang}${path === '/' ? '' : path}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href={getPath("/")} className="flex items-center gap-2 font-bold text-xl mr-6 hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="SSDown Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8 object-contain" 
            priority
            unoptimized
          />
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">SSDown</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href={getPath("/")}>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              {dict?.home || "Home"}
            </Button>
          </Link>
          <Link href={getPath("/x")}>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              {dict?.twitter || "X (Twitter)"}
            </Button>
          </Link>
          <Link href={getPath("/tiktok")}>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              {dict?.tiktok || "TikTok"}
            </Button>
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSelector currentLang={lang} />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
