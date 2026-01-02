"use client";

import { Globe } from "lucide-react";

import { useRouter } from "next/navigation";

export function LanguageSelector({ currentLang }: { currentLang: string }) {
  const router = useRouter();

  const handleLanguageChange = (value: string) => {
    // 언어 변경 시 메인 페이지로 이동
    const newPath = value === "en" ? "/" : `/${value}`;
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
