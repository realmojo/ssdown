import Link from "next/link";
import { PageShell } from "./page-shell";
import { Panel } from "./panel";
import { RankList } from "./rank-list";
import { TOOL_GROUPS } from "@/lib/portal-nav";

export interface HubTool {
  href: string;
  title: string;
  description: string;
}

/**
 * 카테고리 허브(`/tools/*`)의 공용 본문.
 *
 * 카드 그리드 대신 조밀한 2열 목록으로 도구 전체를 한 화면에 노출하고,
 * 우측에 다른 카테고리 바로가기를 둔다.
 */
export function ToolHub({
  groupKey,
  title,
  desc,
  tools,
}: {
  /** TOOL_GROUPS의 key. 현재 카테고리를 우측 목록에서 제외하는 데 쓴다. */
  groupKey: string;
  title: string;
  desc: string;
  tools: HubTool[];
}) {
  const group = TOOL_GROUPS.find((g) => g.key === groupKey);
  const others = TOOL_GROUPS.filter((g) => g.key !== groupKey);

  return (
    <PageShell
      crumbs={[{ label: "도구", href: "/tools" }, { label: group?.label ?? title }]}
      title={title}
      desc={desc}
      actions={
        <span className="text-[12px] text-[var(--pt-text-meta)]">
          총 <strong className="text-[var(--pt-accent)]">{tools.length}</strong>개
        </span>
      }
    >
      <Panel title={`${group?.label ?? title} 전체 목록`}>
        <ul className="grid gap-x-4 sm:grid-cols-2">
          {tools.map((t) => (
            <li key={t.href} className="min-w-0 border-b border-[var(--pt-line)]">
              <Link href={t.href} className="group block py-1.5">
                <span className="text-[13px] font-semibold text-[var(--pt-text)] group-hover:text-[var(--pt-accent)] group-hover:underline">
                  {t.title}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-[var(--pt-text-meta)]">
                  {t.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-2 md:grid-cols-2">
        {others.slice(0, 2).map((g) => (
          <Panel key={g.key} title={g.label} href={g.hub} moreHref={g.hub}>
            <RankList items={g.items.slice(0, 8)} />
          </Panel>
        ))}
      </div>

      <Panel title="다른 카테고리">
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
          {others.map((g) => (
            <li key={g.key}>
              <Link
                href={g.hub}
                className="block border border-[var(--pt-line)] px-2 py-1.5 text-center text-[12px] font-semibold hover:border-[var(--pt-accent)] hover:text-[var(--pt-accent)]"
              >
                {g.label}
                <span className="ml-1 font-normal text-[var(--pt-text-meta)]">
                  {g.items.length}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </PageShell>
  );
}
