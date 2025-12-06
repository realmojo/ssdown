"use client"

import * as React from "react"
import { Globe } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useRouter, usePathname } from "next/navigation"

export function LanguageSelector({ currentLang }: { currentLang: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (value: string) => {
    // Current path segments
    // if pathname is /jp/x, segments are ['', 'jp', 'x']
    // if pathname is /x, segments are ['', 'x'] (because en is hidden)
    
    // We want to replace the language segment or prepend it.
    
    if (!pathname) return

    let newPath = pathname
    const segments = pathname.split('/')
    
    // Check if the current path starts with a known locale (excluding en because it's hidden)
    // Actually we know currentLang.
    
    if (currentLang !== 'en') {
        // We are at /jp/... or /kr/...
        // We need to replace /jp with /value
        // If value is 'en', we remove /jp
        
        // Remove the lang prefix
        // segments[1] is the lang
        const rest = segments.slice(2).join('/')
        newPath = `/${rest}` // This is the 'en' path
        
        if (value !== 'en') {
            newPath = `/${value}/${rest}`
        }
    } else {
        // We are at /... (en)
        // If value is not 'en', we prepend /value
        if (value !== 'en') {
            newPath = `/${value}${pathname}`
        }
    }
    
    // Clean up double slashes just in case
    newPath = newPath.replace('//', '/')
    if (newPath === '') newPath = '/'

    router.push(newPath)
  }

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px] bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select Language" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="jp">日本語</SelectItem>
          <SelectItem value="kr">한국어</SelectItem>
          <SelectItem value="pt">Português</SelectItem>
          <SelectItem value="fr">Français</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
