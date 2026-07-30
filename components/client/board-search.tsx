"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

/** 게시판 제목줄에 들어가는 검색 상자. */
export function BoardSearch({ initialQ }: { initialQ: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/board?q=${encodeURIComponent(term)}` : "/board");
  }

  return (
    <form onSubmit={submit} className="flex items-center">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="제목·내용·글쓴이"
        aria-label="게시판 검색어"
        className="pt-input !h-6 w-28 rounded-r-none border-r-0 text-[12px] sm:w-40"
      />
      <button type="submit" aria-label="검색" className="pt-btn !h-6 rounded-l-none px-1.5">
        <Search size={13} />
      </button>
    </form>
  );
}
