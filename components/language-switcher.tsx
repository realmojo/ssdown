"use client";

import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n-utils";

interface LanguageSwitcherProps {
  locale: Locale;
}

const LANGUAGES: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "EN" },
  { value: "kr", label: "한국어", flag: "KR" },
];

function setLocaleCookie(locale: Locale) {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=${maxAge};samesite=lax`;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const currentLang = LANGUAGES.find((l) => l.value === locale) ?? LANGUAGES[0];

  const handleSelect = (newLocale: Locale) => {
    if (newLocale === locale) return;
    setLocaleCookie(newLocale);
    window.location.reload();
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
