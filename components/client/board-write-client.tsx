"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

/** 글쓰기·수정 공용 폼. `postId`가 있으면 수정 모드로 동작한다. */
export function BoardWriteClient({
  postId,
  initialTitle = "",
  initialContent = "",
  initialWriter = "",
}: {
  postId?: number;
  initialTitle?: string;
  initialContent?: string;
  initialWriter?: string;
}) {
  const router = useRouter();
  const isEdit = typeof postId === "number";

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [writer, setWriter] = useState(initialWriter);
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState(""); // 허니팟
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해 주세요.");
      return;
    }
    if (!isEdit && (!writer.trim() || password.length < 4)) {
      toast.error("닉네임과 4자 이상의 비밀번호를 입력해 주세요.");
      return;
    }
    if (isEdit && !password) {
      toast.error("비밀번호를 입력해 주세요.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(isEdit ? `/api/board/${postId}` : "/api/board", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, writer, password, website }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "처리에 실패했습니다.");
        return;
      }

      toast.success(isEdit ? "수정했습니다." : "등록했습니다.");
      router.push(`/board/${isEdit ? postId : data.id}`);
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="pt-panel">
      <div className="pt-panel-hd">
        <h2>{isEdit ? "글 수정" : "새 글 쓰기"}</h2>
      </div>

      <div className="space-y-2 p-3">
        {!isEdit && (
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold">닉네임</span>
              <input
                value={writer}
                onChange={(e) => setWriter(e.target.value)}
                maxLength={20}
                required
                placeholder="표시할 이름"
                className="pt-input w-full"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={100}
                required
                placeholder="수정·삭제할 때 필요합니다 (4자 이상)"
                className="pt-input w-full"
              />
            </label>
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
            className="pt-input w-full"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold">내용</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={10000}
            required
            rows={14}
            className="pt-input w-full resize-y !h-auto py-2 leading-relaxed"
          />
          <span className="mt-0.5 block text-right text-[11px] text-[var(--pt-text-meta)]">
            {content.length.toLocaleString()} / 10,000자
          </span>
        </label>

        {isEdit && (
          <label className="block sm:max-w-xs">
            <span className="mb-1 block text-[12px] font-semibold">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="글을 쓸 때 정한 비밀번호"
              className="pt-input w-full"
            />
          </label>
        )}

        {/* 봇 판별용. 사람에게는 보이지 않는다. */}
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

        <p className="border-t border-[var(--pt-line)] pt-2 text-[11px] text-[var(--pt-text-meta)]">
          작성한 글은 누구나 볼 수 있습니다. 개인정보나 연락처는 남기지 마세요. 광고·욕설·도배 글은
          예고 없이 삭제될 수 있습니다.
        </p>

        <div className="flex justify-end gap-1.5 border-t border-[var(--pt-line)] pt-2">
          <Link href={isEdit ? `/board/${postId}` : "/board"} className="pt-btn">
            취소
          </Link>
          <button type="submit" disabled={busy} className="pt-btn pt-btn-primary disabled:opacity-50">
            {busy ? "처리 중…" : isEdit ? "수정하기" : "등록하기"}
          </button>
        </div>
      </div>
    </form>
  );
}
