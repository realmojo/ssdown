"use client";

import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Locale } from "@/lib/i18n-utils";

interface LanguageSwitcherProps {
  locale: Locale;
}

const LANGUAGES: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "EN" },
  { value: "kr", label: "한국어", flag: "KR" },
];

/** Rewrite the current path to the target locale's URL (Korean under /kr). */
function localeHref(pathname: string, target: Locale): string {
  const stripped = pathname.replace(/^\/kr(?=\/|$)/, "") || "/";
  if (target === "kr") return stripped === "/" ? "/kr" : `/kr${stripped}`;
  return stripped;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const currentLang = LANGUAGES.find((l) => l.value === locale) ?? LANGUAGES[0];

  const handleSelect = (newLocale: Locale) => {
    if (newLocale === locale) return;
    window.location.assign(localeHref(pathname, newLocale));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-sm font-medium"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.flag}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => handleSelect(lang.value)}
            className={lang.value === locale ? "bg-accent" : ""}
          >
            <span className="mr-2 font-medium">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
