"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/** 상세 화면의 수정·삭제 버튼. 두 동작 모두 비밀번호를 물어본다. */
export function BoardPostActions({ postId }: { postId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (busy) return;
    const pw = window.prompt("글을 쓸 때 정한 비밀번호를 입력하세요.");
    if (pw === null) return;
    if (!pw) {
      toast.error("비밀번호를 입력해 주세요.");
      return;
    }
    if (!window.confirm("이 글을 삭제할까요? 되돌릴 수 없습니다.")) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/board/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "삭제에 실패했습니다.");
        return;
      }
      toast.success("삭제했습니다.");
      router.push("/board");
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-1.5">
      <a href={`/board/${postId}/edit`} className="pt-btn">
        수정
      </a>
      <button type="button" onClick={remove} disabled={busy} className="pt-btn disabled:opacity-50">
        삭제
      </button>
    </div>
  );
}
