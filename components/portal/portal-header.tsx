"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import {
  COMMUNITY_ITEMS,
  DOWNLOADER_ITEMS,
  PLATFORM_ITEMS,
  PRIMARY_NAV,
  TOOL_GROUPS,
} from "@/lib/portal-nav";

/**
 * 고밀도 포털 헤더.
 *
 * 3단 구성이다.
 *  1) 유틸 줄  — 사이트명 + 보조 링크 (24px)
 *  2) 브랜드 줄 — 로고 + 검색창 (48px)
 *  3) 메뉴 줄  — 카테고리 가로 나열 + 호버 드롭다운 (34px)
 *
 * 모바일에서는 2)만 남기고 메뉴는 햄버거 패널로 접는다.
 */
export function PortalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  const menus = [
    ...TOOL_GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      href: g.hub,
      items: g.items,
    })),
    {
      key: "downloader",
      label: "영상 다운로드",
      href: "/",
      items: DOWNLOADER_ITEMS,
    },
    {
      key: "software",
      label: "소프트웨어",
      href: "/software",
      items: PLATFORM_ITEMS,
    },
    {
      key: "community",
      label: "자유게시판",
      href: "/board",
      items: COMMUNITY_ITEMS,
    },
  ];

  return (
    <header className="border-b border-[var(--pt-line-strong)] bg-white">
      {/* 1) 유틸 줄 */}
      <div className="hidden border-b border-[var(--pt-line)] bg-[var(--pt-head)] md:block">
        <div className="pt-wrap flex h-6 items-center justify-between text-[11px] text-[var(--pt-text-meta)]">
          <span>무료 온라인 도구 · 영상 다운로드 · 소프트웨어 정보</span>
          <nav className="flex items-center gap-3">
            <Link href="/about" className="hover:text-[var(--pt-accent)]">
              소개
            </Link>
            <Link href="/contact" className="hover:text-[var(--pt-accent)]">
              문의
            </Link>
            <Link href="/blog" className="hover:text-[var(--pt-accent)]">
              블로그
            </Link>
            <Link href="/board" className="hover:text-[var(--pt-accent)]">
              자유게시판
            </Link>
          </nav>
        </div>
      </div>

      {/* 2) 브랜드 줄 */}
      <div className="pt-wrap flex h-12 items-center gap-3">
        <button
          type="button"
          aria-label="메뉴"
          className="-ml-1 p-1 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          href="/"
          className="text-[19px] font-extrabold tracking-tight text-[var(--pt-text)]"
        >
          SSDown
        </Link>

        <form onSubmit={submitSearch} className="ml-auto flex items-center">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="도구·소프트웨어 검색"
            aria-label="검색어"
            className="pt-input w-36 rounded-r-none border-r-0 sm:w-56"
          />
          <button
            type="submit"
            aria-label="검색"
            className="pt-btn pt-btn-primary rounded-l-none px-2.5"
          >
            <Search size={15} />
          </button>
        </form>
      </div>

      {/* 3) 메뉴 줄 */}
      <nav
        className="hidden border-t border-[var(--pt-line)] md:block"
        onMouseLeave={() => setOpenKey(null)}
      >
        <div className="pt-wrap relative">
          <ul className="flex h-[34px] items-stretch">
            {PRIMARY_NAV.slice(0, 1).map((n) => (
              <li key={n.href} className="flex">
                <Link
                  href={n.href}
                  className="flex items-center px-3 text-[13px] font-bold text-[var(--pt-accent)]"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            {menus.map((m) => {
              const active =
                pathname === m.href ||
                m.items.some((it) => pathname === it.href);
              return (
                <li key={m.key} className="flex">
                  <Link
                    href={m.href}
                    onMouseEnter={() => setOpenKey(m.key)}
                    onFocus={() => setOpenKey(m.key)}
                    className={`flex items-center px-3 text-[13px] ${
                      active
                        ? "font-bold text-[var(--pt-accent)]"
                        : "text-[var(--pt-text)] hover:text-[var(--pt-accent)]"
                    }`}
                  >
                    {m.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {openKey && (
            <div className="absolute left-0 right-0 top-full z-50 border border-[var(--pt-line-strong)] border-t-0 bg-white p-2 shadow-sm">
              <ul className="grid grid-cols-4 gap-x-4 gap-y-0.5 lg:grid-cols-6">
                {menus
                  .find((m) => m.key === openKey)!
                  .items.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={() => setOpenKey(null)}
                        className="block truncate py-1 text-[12px] text-[var(--pt-text-sub)] hover:text-[var(--pt-accent)] hover:underline"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* 모바일 패널 */}
      {mobileOpen && (
        <div className="border-t border-[var(--pt-line)] bg-white md:hidden">
          <div className="pt-wrap max-h-[70vh] overflow-y-auto py-2">
            {menus.map((m) => (
              <details key={m.key} className="border-b border-[var(--pt-line)]">
                <summary className="cursor-pointer py-2 text-[13px] font-bold">
                  {m.label}
                </summary>
                <ul className="grid grid-cols-2 gap-x-3 pb-2">
                  {m.items.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={() => setMobileOpen(false)}
                        className="block truncate py-1 text-[12px] text-[var(--pt-text-sub)]"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
