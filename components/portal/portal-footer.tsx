import Link from "next/link";
import { DOWNLOADER_ITEMS, TOOL_GROUPS } from "@/lib/portal-nav";

/**
 * 고밀도 포털 푸터. 전 카테고리 링크를 6열로 펼쳐 내부 링크를 확보하고,
 * 하단에 정책 링크와 저작권 줄을 둔다.
 */
export function PortalFooter() {
  return (
    <footer className="mt-3 border-t border-[var(--pt-line-strong)] bg-white">
      <div className="pt-wrap py-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 lg:grid-cols-7">
          {TOOL_GROUPS.map((g) => (
            <div key={g.key}>
              <Link
                href={g.hub}
                className="mb-1 block text-[12px] font-bold text-[var(--pt-text)] hover:text-[var(--pt-accent)]"
              >
                {g.label}
              </Link>
              <ul>
                {g.items.slice(0, 8).map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="block truncate py-[1px] text-[11px] text-[var(--pt-text-meta)] hover:text-[var(--pt-accent)]"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <Link
              href="/"
              className="mb-1 block text-[12px] font-bold text-[var(--pt-text)] hover:text-[var(--pt-accent)]"
            >
              영상 다운로드
            </Link>
            <ul>
              {DOWNLOADER_ITEMS.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="block truncate py-[1px] text-[11px] text-[var(--pt-text-meta)] hover:text-[var(--pt-accent)]"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--pt-line)] bg-[var(--pt-head)]">
        <div className="pt-wrap flex flex-col gap-1 py-3 text-[11px] text-[var(--pt-text-meta)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SSDown. 모든 권리 보유.</p>
          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/about" className="hover:text-[var(--pt-accent)]">
              사이트 소개
            </Link>
            <Link href="/contact" className="hover:text-[var(--pt-accent)]">
              문의하기
            </Link>
            <Link href="/privacy" className="hover:text-[var(--pt-accent)]">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-[var(--pt-accent)]">
              이용약관
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
    </footer>
  );
}
