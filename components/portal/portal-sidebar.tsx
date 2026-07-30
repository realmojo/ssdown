"use client";

import { usePathname } from "next/navigation";
import {
  COMMUNITY_ITEMS,
  DOWNLOADER_ITEMS,
  PLATFORM_ITEMS,
  TOOL_GROUPS,
  type NavItem,
} from "@/lib/portal-nav";

/**
 * 좌측 카테고리 트리. 그누보드 좌측 메뉴처럼 전 카테고리를 항상 펼쳐 둔다.
 * 현재 경로에 해당하는 항목만 파란 굵은 글씨로 표시한다.
 *
 * 데스크톱 전용(모바일은 헤더 햄버거 패널이 같은 역할을 한다).
 */
export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[180px] shrink-0 lg:block">
      <div className="sticky top-2 space-y-2">
        <Block title="영상 다운로드" items={DOWNLOADER_ITEMS} pathname={pathname} />
        {TOOL_GROUPS.map((g) => (
          <Block
            key={g.key}
            title={g.label}
            href={g.hub}
            items={g.items}
            pathname={pathname}
          />
        ))}
        <Block title="소프트웨어" href="/software" items={PLATFORM_ITEMS} pathname={pathname} />
        <Block title="커뮤니티" href="/board" items={COMMUNITY_ITEMS} pathname={pathname} />
      </div>
    </aside>
  );
}

function Block({
  title,
  href,
  items,
  pathname,
}: {
  title: string;
  href?: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <nav className="pt-panel overflow-hidden">
      <div className="pt-panel-hd !h-7">
        {href ? (
          <a href={href} className="text-[12px] font-bold hover:text-[var(--pt-accent)]">
            {title}
          </a>
        ) : (
          <h3 className="!text-[12px]">{title}</h3>
        )}
      </div>
      <ul className="py-1">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <a
                href={it.href}
                className={`block truncate px-2.5 py-[3px] text-[12px] ${
                  active
                    ? "font-bold text-[var(--pt-accent)]"
                    : "text-[var(--pt-text-sub)] hover:bg-[var(--pt-hover)] hover:text-[var(--pt-accent)]"
                }`}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
