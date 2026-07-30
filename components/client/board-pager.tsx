
/** 게시판 페이지 이동. 현재 쪽 기준 앞뒤 2쪽씩과 처음·끝을 보여준다. */
export function BoardPager({
  currentPage,
  totalPages,
  q,
}: {
  currentPage: number;
  totalPages: number;
  q?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (page: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    const s = params.toString();
    return s ? `/board?${s}` : "/board";
  };

  const delta = 2;
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
      pages.push("...");
    }
  }

  const base = "inline-flex h-7 min-w-7 items-center justify-center border px-2 text-[12px]";
  const active = `${base} border-[var(--pt-accent)] bg-[var(--pt-accent)] font-bold text-white`;
  const normal = `${base} border-[var(--pt-line)] bg-white text-[var(--pt-text-sub)] hover:border-[var(--pt-accent)] hover:text-[var(--pt-accent)]`;
  const disabled = `${base} pointer-events-none border-[var(--pt-line)] bg-white text-[var(--pt-text-meta)] opacity-50`;

  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="게시판 쪽 이동">
      {currentPage > 1 ? (
        <a href={href(currentPage - 1)} className={normal}>
          이전
        </a>
      ) : (
        <span className={disabled}>이전</span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-1 text-[12px] text-[var(--pt-text-meta)]">
            …
          </span>
        ) : (
          <a key={p} href={href(p)} className={p === currentPage ? active : normal}>
            {p}
          </a>
        ),
      )}

      {currentPage < totalPages ? (
        <a href={href(currentPage + 1)} className={normal}>
          다음
        </a>
      ) : (
        <span className={disabled}>다음</span>
      )}
    </nav>
  );
}
