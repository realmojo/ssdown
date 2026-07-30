import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  LIMITS,
  getPost,
  hashIp,
  hashPassword,
  verifyPassword,
} from "@/lib/board-utils";
import { clientIp } from "../../route";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** 댓글 작성 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await ctx.params;
  const postId = Number(idParam);
  if (!Number.isInteger(postId) || postId <= 0) return bad("잘못된 요청입니다.");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("잘못된 요청입니다.");
  }

  const content = String(body.content ?? "").trim();
  const writer = String(body.writer ?? "").trim();
  const password = String(body.password ?? "");
  const honeypot = String(body.website ?? "");

  if (honeypot) return NextResponse.json({ ok: true });

  if (!content || !writer || !password) {
    return bad("내용, 닉네임, 비밀번호를 모두 입력해 주세요.");
  }
  if (content.length > LIMITS.comment) return bad(`댓글은 ${LIMITS.comment}자 이내로 입력해 주세요.`);
  if (writer.length > LIMITS.writer) return bad(`닉네임은 ${LIMITS.writer}자 이내로 입력해 주세요.`);
  if (password.length < 4) return bad("비밀번호는 4자 이상으로 입력해 주세요.");

  if (!(await getPost(postId))) return bad("글을 찾을 수 없습니다.", 404);

  const { error } = await supabase.from("ssdown_board_comments").insert({
    post_id: postId,
    content,
    writer,
    password_hash: await hashPassword(password),
    ip: await hashIp(clientIp(req)),
  });

  if (error) {
    console.error("댓글 등록 실패", error);
    return bad("등록에 실패했습니다.", 500);
  }
  return NextResponse.json({ ok: true });
}

/** 댓글 삭제 */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await ctx.params;
  const postId = Number(idParam);
  if (!Number.isInteger(postId) || postId <= 0) return bad("잘못된 요청입니다.");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("잘못된 요청입니다.");
  }

  const commentId = Number(body.commentId);
  const password = String(body.password ?? "");
  if (!Number.isInteger(commentId) || commentId <= 0) return bad("잘못된 요청입니다.");
  if (!password) return bad("비밀번호를 입력해 주세요.");

  const { data } = await supabase
    .from("ssdown_board_comments")
    .select("id,password_hash")
    .eq("id", commentId)
    .eq("post_id", postId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) return bad("댓글을 찾을 수 없습니다.", 404);
  if (!(await verifyPassword(password, data.password_hash))) {
    return bad("비밀번호가 일치하지 않습니다.", 403);
  }

  const { error } = await supabase
    .from("ssdown_board_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) {
    console.error("댓글 삭제 실패", error);
    return bad("삭제에 실패했습니다.", 500);
  }
  return NextResponse.json({ ok: true });
}
