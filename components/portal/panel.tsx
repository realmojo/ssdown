import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 제목 줄이 붙은 테두리 박스. 포털의 모든 섹션은 이 컴포넌트로 감싼다.
 *
 * `flush`를 주면 본문 패딩을 없앤다(테이블·목록을 테두리에 붙일 때 쓴다).
 */
export function Panel({
  title,
  href,
  more,
  moreHref,
  right,
  flush,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  /** 제목 자체를 링크로 만들 때 */
  href?: string;
  /** 우측 "더보기" 링크 라벨. 기본 "더보기 +" */
  more?: string;
  moreHref?: string;
  /** 우측에 직접 넣을 요소 (탭 등). moreHref보다 우선한다. */
  right?: ReactNode;
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("pt-panel", className)}>
      {title && (
        <div className="pt-panel-hd">
          {href ? (
            <a href={href} className="text-[13px] font-bold hover:text-[var(--pt-accent)]">
              {title}
            </a>
          ) : (
            <h2>{title}</h2>
          )}
          {right ??
            (moreHref && (
              <a
                href={moreHref}
                className="text-[11px] text-[var(--pt-text-meta)] hover:text-[var(--pt-accent)]"
              >
                {more ?? "더보기 +"}
              </a>
            ))}
        </div>
      )}
      <div className={cn(flush ? "" : "pt-panel-bd", bodyClassName)}>{children}</div>
    </section>
  );
}
