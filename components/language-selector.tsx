"use client";

import { Globe } from "lucide-react";

import { useRouter, usePathname } from "next/navigation";

export function LanguageSelector({ currentLang }: { currentLang: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (value: string) => {
    // Current path segments
    // if pathname is /jp/x, segments are ['', 'jp', 'x']
    // if pathname is /x, segments are ['', 'x'] (because en is hidden)

    // We want to replace the language segment or prepend it.

    if (!pathname) return;

    let newPath = pathname;
    const segments = pathname.split("/");

    // Check if the current path starts with a known locale (excluding en because it's hidden)
    // Actually we know currentLang.

    if (currentLang !== "en") {
      // We are at /jp/... or /kr/...
      // We need to replace /jp with /value
      // If value is 'en', we remove /jp

      // Remove the lang prefix
      // segments[1] is the lang
      const rest = segments.slice(2).join("/");
      newPath = `/${rest}`; // This is the 'en' path

      if (value !== "en") {
        newPath = `/${value}/${rest}`;
      }
    } else {
      // We are at /... (en)
      // If value is not 'en', we prepend /value
      if (value !== "en") {
        newPath = `/${value}${pathname}`;
      }
    }

    // Clean up double slashes just in case
    newPath = newPath.replace("//", "/");
    if (newPath === "") newPath = "/";

    router.push(newPath);
  };

  return (
    <div className="relative">
      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="w-[140px] bg-background/50 backdrop-blur-sm h-10 pl-9 pr-8 rounded-md border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer appearance-none"
      >
        <option value="en">English</option>
        <option value="jp">日本語</option>
        <option value="kr">한국어</option>
        <option value="pt">Português</option>
        <option value="fr">Français</option>
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}
