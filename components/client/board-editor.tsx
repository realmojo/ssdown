"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Code,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";

/**
 * HTML 본문 편집기.
 *
 * WYSIWYG 대신 "HTML 을 직접 쓰고 미리보기로 확인"하는 방식이다. 도구 모음은
 * 선택 영역을 태그로 감싸 주는 보조일 뿐이라, 어떤 태그가 들어가는지 작성자가
 * 그대로 볼 수 있다.
 *
 * 미리보기는 눈으로 확인하는 용도이고, 실제 정제는 저장할 때 서버에서 한다.
 */

type Wrap = { open: string; close: string; block?: boolean };

const TOOLS: {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  wrap?: Wrap;
  insert?: string;
  prompt?: "link" | "image";
}[] = [
  { key: "b", label: "굵게", icon: Bold, wrap: { open: "<strong>", close: "</strong>" } },
  { key: "i", label: "기울임", icon: Italic, wrap: { open: "<em>", close: "</em>" } },
  { key: "u", label: "밑줄", icon: Underline, wrap: { open: "<u>", close: "</u>" } },
  { key: "s", label: "취소선", icon: Strikethrough, wrap: { open: "<s>", close: "</s>" } },
  { key: "h2", label: "소제목", icon: Heading2, wrap: { open: "<h2>", close: "</h2>", block: true } },
  { key: "ul", label: "글머리 목록", icon: List, wrap: { open: "<ul>\n  <li>", close: "</li>\n</ul>", block: true } },
  { key: "ol", label: "번호 목록", icon: ListOrdered, wrap: { open: "<ol>\n  <li>", close: "</li>\n</ol>", block: true } },
  { key: "quote", label: "인용", icon: Quote, wrap: { open: "<blockquote>", close: "</blockquote>", block: true } },
  { key: "code", label: "코드", icon: Code, wrap: { open: "<pre><code>", close: "</code></pre>", block: true } },
  { key: "a", label: "링크", icon: LinkIcon, prompt: "link" },
  { key: "img", label: "이미지", icon: ImageIcon, prompt: "image" },
  { key: "hr", label: "구분선", icon: Minus, insert: "\n<hr>\n" },
];

/** 미리보기에서 명백히 위험한 것만 걷어낸다. 최종 판단은 서버가 한다. */
function previewHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input)\b[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
}

export function BoardEditor({
  value,
  onChange,
  maxLength,
}: {
  value: string;
  onChange: (next: string) => void;
  maxLength: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  /** 선택 영역을 태그로 감싸거나, 커서 위치에 문자열을 넣는다. */
  function apply(tool: (typeof TOOLS)[number]) {
    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    let inserted = "";
    if (tool.insert) {
      inserted = tool.insert;
    } else if (tool.prompt === "link") {
      const url = window.prompt("링크 주소를 입력하세요.", "https://");
      if (!url) return;
      const text = selected || window.prompt("링크에 표시할 글자", url) || url;
      inserted = `<a href="${url}">${text}</a>`;
    } else if (tool.prompt === "image") {
      const url = window.prompt("이미지 주소를 입력하세요.", "https://");
      if (!url) return;
      const alt = window.prompt("이미지 설명(대체 텍스트)", "") ?? "";
      inserted = `<img src="${url}" alt="${alt}">`;
    } else if (tool.wrap) {
      const { open, close, block } = tool.wrap;
      inserted = `${block ? "\n" : ""}${open}${selected}${close}${block ? "\n" : ""}`;
    }

    const next = value.slice(0, start) + inserted + value.slice(end);
    if (next.length > maxLength) return;
    onChange(next);

    // 감싼 경우 안쪽 글자가 그대로 선택된 상태로 남게 커서를 되돌린다.
    requestAnimationFrame(() => {
      el.focus();
      const offset = tool.wrap ? start + (tool.wrap.block ? 1 : 0) + tool.wrap.open.length : start + inserted.length;
      el.setSelectionRange(offset, offset + (tool.wrap ? selected.length : 0));
    });
  }

  return (
    <div className="border border-[var(--pt-line-strong)]">
      {/* 도구 모음 */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--pt-line)] bg-[var(--pt-head)] px-1 py-1">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              title={t.label}
              aria-label={t.label}
              disabled={preview}
              onClick={() => apply(t)}
              className="flex h-6 w-6 items-center justify-center border border-transparent text-[var(--pt-text-sub)] hover:border-[var(--pt-line)] hover:bg-white hover:text-[var(--pt-accent)] disabled:opacity-40"
            >
              <Icon size={13} />
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`h-6 px-2 text-[11px] ${
              preview
                ? "text-[var(--pt-text-sub)] hover:text-[var(--pt-accent)]"
                : "border border-[var(--pt-line)] bg-white font-bold text-[var(--pt-accent)]"
            }`}
          >
            HTML
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`h-6 px-2 text-[11px] ${
              preview
                ? "border border-[var(--pt-line)] bg-white font-bold text-[var(--pt-accent)]"
                : "text-[var(--pt-text-sub)] hover:text-[var(--pt-accent)]"
            }`}
          >
            미리보기
          </button>
        </div>
      </div>

      {preview ? (
        <div
          className="board-content min-h-[320px] break-words px-3 py-3 text-[13px] leading-[1.8]"
          dangerouslySetInnerHTML={{ __html: previewHtml(value) }}
        />
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          required
          rows={16}
          spellCheck={false}
          placeholder={"<p>내용을 입력하세요.</p>\n\n허용 태그: p, br, strong, em, u, s, h2~h6, ul, ol, li,\nblockquote, pre, code, a, img, table, hr 등"}
          className="w-full resize-y bg-white px-3 py-2 font-mono text-[12px] leading-[1.7] text-[var(--pt-text)] outline-none"
        />
      )}

      <div className="flex items-center justify-between border-t border-[var(--pt-line)] bg-[var(--pt-head)] px-2 py-1 text-[11px] text-[var(--pt-text-meta)]">
        <span>
          HTML 로 작성합니다. 스크립트·iframe 등 허용되지 않은 태그는 저장할 때 제거됩니다.
        </span>
        <span className="shrink-0">
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}자
        </span>
      </div>
    </div>
  );
}
