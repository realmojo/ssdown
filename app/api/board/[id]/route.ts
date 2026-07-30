import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { LIMITS, getPostWithHash, verifyPassword } from "@/lib/board-utils";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * 비밀번호를 대조해 대상 글을 돌려준다.
 * 존재 여부와 비밀번호 불일치를 같은 문구로 처리하지는 않는다 —
 * 글 존재 자체는 목록에서 이미 공개된 정보다.
 */
async function authorize(req: NextRequest, idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return { error: bad("잘못된 요청입니다.") };

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return { error: bad("잘못된 요청입니다.") };
  }

  const password = String(body.password ?? "");
  if (!password) return { error: bad("비밀번호를 입력해 주세요.") };

  const found = await getPostWithHash(id);
  if (!found) return { error: bad("글을 찾을 수 없습니다.", 404) };

  if (!(await verifyPassword(password, found.passwordHash))) {
    return { error: bad("비밀번호가 일치하지 않습니다.", 403) };
  }

  return { id, body };
}

/** 글 수정 */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await ctx.params;
  const auth = await authorize(req, idParam);
  if (auth.error) return auth.error;

  const title = String(auth.body.title ?? "").trim();
  const content = String(auth.body.content ?? "").trim();

  if (!title || !content) return bad("제목과 내용을 입력해 주세요.");
  if (title.length > LIMITS.title) return bad(`제목은 ${LIMITS.title}자 이내로 입력해 주세요.`);
  if (content.length > LIMITS.content) return bad(`내용은 ${LIMITS.content}자 이내로 입력해 주세요.`);

  const { error } = await supabase
    .from("ssdown_board_posts")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", auth.id);

  if (error) {
    console.error("게시글 수정 실패", error);
    return bad("수정에 실패했습니다.", 500);
  }
  return NextResponse.json({ ok: true, id: auth.id });
}

/** 글 삭제 — 행은 남기고 deleted_at 만 채운다. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await ctx.params;
  const auth = await authorize(req, idParam);
  if (auth.error) return auth.error;

  const { error } = await supabase
    .from("ssdown_board_posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", auth.id);

  if (error) {
    console.error("게시글 삭제 실패", error);
    return bad("삭제에 실패했습니다.", 500);
  }
  return NextResponse.json({ ok: true });
}
