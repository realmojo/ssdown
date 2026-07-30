import Link from "next/link";
import type { NavItem } from "@/lib/portal-nav";

/**
 * 번호가 붙은 인기 목록. 사이드 위젯이나 패널 본문에 넣는다.
 * 1~3위는 빨간 굵은 번호로 강조한다.
 */
export function RankList({
  items,
  meta,
}: {
  items: NavItem[];
  /** href → 우측에 붙일 보조 텍스트 (조회수 등) */
  meta?: Record<string, string>;
}) {
  return (
    <ol className="divide-y divide-[var(--pt-line)]">
      {items.map((it, i) => (
        <li key={it.href} className="flex items-center gap-2 py-[5px] first:pt-0 last:pb-0">
          <span
            className={`w-4 shrink-0 text-center text-[11px] tabular-nums ${
              i < 3
                ? "font-bold text-[var(--pt-hot)]"
                : "text-[var(--pt-text-meta)]"
            }`}
          >
            {i + 1}
          </span>
          <Link href={it.href} className="pt-link min-w-0 flex-1 truncate text-[12px]">
            {it.label}
          </Link>
          {meta?.[it.href] && (
            <span className="shrink-0 text-[11px] text-[var(--pt-text-meta)]">
              {meta[it.href]}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
