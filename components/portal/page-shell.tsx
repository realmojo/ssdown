import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { PortalSidebar } from "./portal-sidebar";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * 모든 하위 페이지의 공통 골격.
 *
 *  [좌 카테고리 트리] [ 경로 > 표시 / 제목 줄 / 본문 ] [우 위젯(선택)]
 *
 * `sidebar={false}`로 좌측 트리를 뺄 수 있다(메인 등 전폭 레이아웃).
 */
export function PageShell({
  crumbs,
  title,
  desc,
  actions,
  aside,
  sidebar = true,
  children,
}: {
  crumbs?: Crumb[];
  title?: string;
  desc?: string;
  /** 제목 줄 우측 요소 */
  actions?: ReactNode;
  /** 우측 위젯 열 (240px) */
  aside?: ReactNode;
  sidebar?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="pt-wrap flex gap-2 py-2">
      {sidebar && <PortalSidebar />}

      <div className="min-w-0 flex-1">
        {crumbs && crumbs.length > 0 && (
          <nav
            aria-label="현재 위치"
            className="mb-1.5 flex flex-wrap items-center gap-0.5 text-[11px] text-[var(--pt-text-meta)]"
          >
            <Link href="/" className="hover:text-[var(--pt-accent)]">
              홈
            </Link>
            {crumbs.map((c) => (
              <span key={c.label} className="flex items-center gap-0.5">
                <ChevronRight size={11} className="shrink-0" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-[var(--pt-accent)]">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-[var(--pt-text-sub)]">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {title && (
          <div className="mb-2 flex items-end justify-between gap-3 border-b-2 border-[var(--pt-text)] pb-1.5">
            <div className="min-w-0">
              <h1 className="truncate text-[17px] font-extrabold leading-tight tracking-tight">
                {title}
              </h1>
              {desc && (
                <p className="mt-0.5 line-clamp-2 text-[12px] text-[var(--pt-text-sub)]">
                  {desc}
                </p>
              )}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        )}

        {aside ? (
          <div className="flex gap-2">
            <div className="min-w-0 flex-1 space-y-2">{children}</div>
            <div className="hidden w-[240px] shrink-0 space-y-2 xl:block">{aside}</div>
          </div>
        ) : (
          <div className="space-y-2">{children}</div>
        )}
      </div>
    </div>
  );
}
