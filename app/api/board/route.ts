import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  BOARD_KEY,
  LIMITS,
  hashIp,
  hashPassword,
  isRateLimited,
} from "@/lib/board-utils";

/** 프록시를 거쳐 들어온 요청에서 클라이언트 IP를 뽑는다. */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** 글 작성 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("잘못된 요청입니다.");
  }

  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();
  const writer = String(body.writer ?? "").trim();
  const password = String(body.password ?? "");
  // 사람 눈에 보이지 않는 입력란. 값이 차 있으면 봇으로 본다.
  const honeypot = String(body.website ?? "");

  if (honeypot) return NextResponse.json({ ok: true, id: 0 });

  if (!title || !content || !writer || !password) {
    return bad("제목, 내용, 닉네임, 비밀번호를 모두 입력해 주세요.");
  }
  if (title.length > LIMITS.title) return bad(`제목은 ${LIMITS.title}자 이내로 입력해 주세요.`);
  if (content.length > LIMITS.content) return bad(`내용은 ${LIMITS.content}자 이내로 입력해 주세요.`);
  if (writer.length > LIMITS.writer) return bad(`닉네임은 ${LIMITS.writer}자 이내로 입력해 주세요.`);
  if (password.length < 4) return bad("비밀번호는 4자 이상으로 입력해 주세요.");
  if (password.length > LIMITS.password) return bad("비밀번호가 너무 깁니다.");

  const ip = await hashIp(clientIp(req));
  if (await isRateLimited(ip)) {
    return bad("잠시 후에 다시 시도해 주세요. 연속 등록은 1분에 한 번만 가능합니다.", 429);
  }

  const { data, error } = await supabase
    .from("ssdown_board_posts")
    .insert({
      board: BOARD_KEY,
      title,
      content,
      writer,
      password_hash: await hashPassword(password),
      ip,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("게시글 등록 실패", error);
    return bad("등록에 실패했습니다. 잠시 후 다시 시도해 주세요.", 500);
  }

  return NextResponse.json({ ok: true, id: data.id });
}
