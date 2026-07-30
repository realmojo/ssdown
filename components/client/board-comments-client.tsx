"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { BoardComment } from "@/lib/board-utils";

function fmt(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${String(d.getFullYear()).slice(2)}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function BoardCommentsClient({
  postId,
  comments,
}: {
  postId: number;
  comments: BoardComment[];
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [writer, setWriter] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState(""); // 허니팟
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!content.trim() || !writer.trim() || password.length < 4) {
      toast.error("닉네임, 4자 이상의 비밀번호, 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/board/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, writer, password, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "등록에 실패했습니다.");
        return;
      }
      setContent("");
      setPassword("");
      toast.success("댓글을 등록했습니다.");
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(commentId: number) {
    const pw = window.prompt("댓글을 쓸 때 정한 비밀번호를 입력하세요.");
    if (pw === null) return;
    if (!pw) {
      toast.error("비밀번호를 입력해 주세요.");
      return;
    }

    try {
      const res = await fetch(`/api/board/${postId}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "삭제에 실패했습니다.");
        return;
      }
      toast.success("댓글을 삭제했습니다.");
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    }
  }

  return (
    <section className="pt-panel">
      <div className="pt-panel-hd">
        <h2>댓글 {comments.length}</h2>
      </div>

      <ul className="divide-y divide-[var(--pt-line)]">
        {comments.map((c) => (
          <li key={c.id} className="px-3 py-2">
            <div className="flex items-center gap-2 text-[11px] text-[var(--pt-text-meta)]">
              <strong className="text-[12px] text-[var(--pt-text)]">{c.writer}</strong>
              <span>{fmt(c.createdAt)}</span>
              <button
                type="button"
                onClick={() => remove(c.id)}
                className="ml-auto hover:text-[var(--pt-hot)] hover:underline"
              >
                삭제
              </button>
            </div>
            {/* 사용자 입력은 평문 그대로 렌더한다. HTML 로 해석하지 않는다. */}
            <p className="mt-0.5 whitespace-pre-wrap break-words text-[12px] leading-relaxed">
              {c.content}
            </p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="px-3 py-6 text-center text-[12px] text-[var(--pt-text-meta)]">
            첫 댓글을 남겨 보세요.
          </li>
        )}
      </ul>

      <form onSubmit={add} className="space-y-1.5 border-t border-[var(--pt-line-strong)] p-3">
        <div className="flex flex-wrap gap-1.5">
          <input
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            maxLength={20}
            placeholder="닉네임"
            aria-label="닉네임"
            className="pt-input w-28"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={100}
            placeholder="비밀번호"
            aria-label="비밀번호"
            className="pt-input w-28"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="댓글을 입력하세요"
          aria-label="댓글 내용"
          className="pt-input !h-auto w-full resize-y py-2 leading-relaxed"
        />
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <div className="flex justify-end">
          <button type="submit" disabled={busy} className="pt-btn pt-btn-primary disabled:opacity-50">
            {busy ? "등록 중…" : "댓글 등록"}
          </button>
        </div>
      </form>
    </section>
  );
}
