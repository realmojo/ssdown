import Link from "next/link";
import type { ReactNode } from "react";

export interface BoardRow {
  /** 좌측 번호 칸. 생략하면 인덱스를 역순으로 매긴다. */
  no?: ReactNode;
  href: string;
  title: string;
  /** 제목 앞 분류 표시 (예: [PDF]) */
  category?: string;
  /** 제목 뒤 뱃지 */
  badge?: "hot" | "new";
  /** 우측 보조 칸 두 개까지 */
  meta1?: ReactNode;
  meta2?: ReactNode;
}

/**
 * 그누보드 게시판 목록 형태의 조밀한 표.
 *
 * 헤더 라벨을 넘기지 않으면 헤더 줄 없이 목록만 그린다(위젯용).
 */
export function BoardTable({
  rows,
  headers,
  startNo,
}: {
  rows: BoardRow[];
  /** [번호, 제목, 보조1, 보조2] 라벨. 생략 시 헤더 숨김 */
  headers?: [string, string, string?, string?];
  /** 번호를 직접 매길 때의 시작값(내림차순) */
  startNo?: number;
}) {
  const hasMeta1 = rows.some((r) => r.meta1 !== undefined);
  const hasMeta2 = rows.some((r) => r.meta2 !== undefined);

  return (
    <div className="overflow-x-auto">
      <table className="pt-table">
        {headers && (
          <thead>
            <tr>
              <th className="pt-td-num">{headers[0]}</th>
              <th className="text-left">{headers[1]}</th>
              {hasMeta1 && <th className="pt-td-meta">{headers[2]}</th>}
              {hasMeta2 && <th className="pt-td-meta">{headers[3]}</th>}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.href + i}>
              <td className="pt-td-num">
                {r.no ?? (startNo !== undefined ? startNo - i : rows.length - i)}
              </td>
              {/* 행 높이를 30px로 고정하려면 제목이 한 줄을 넘지 않아야 한다.
                  테이블 셀에서 truncate가 동작하도록 max-width:0 트릭을 쓴다. */}
              <td className="max-w-0">
                <Link href={r.href} className="pt-link flex items-center gap-1">
                  {r.category && (
                    <span className="shrink-0 text-[var(--pt-text-meta)]">[{r.category}]</span>
                  )}
                  <span className="truncate">{r.title}</span>
                  {r.badge === "hot" && (
                    <span className="pt-badge pt-badge-hot shrink-0">HOT</span>
                  )}
                  {r.badge === "new" && (
                    <span className="pt-badge pt-badge-new shrink-0">N</span>
                  )}
                </Link>
              </td>
              {hasMeta1 && <td className="pt-td-meta">{r.meta1}</td>}
              {hasMeta2 && <td className="pt-td-meta">{r.meta2}</td>}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="!h-16 text-center text-[var(--pt-text-meta)]">
                등록된 항목이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
