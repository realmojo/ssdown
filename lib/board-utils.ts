import "server-only";
import { supabase } from "./supabase";

/**
 * 자유게시판 (비회원 글쓰기).
 *
 * 로그인 체계가 없으므로 그누보드처럼 "닉네임 + 비밀번호" 방식을 쓴다.
 * 비밀번호는 PBKDF2-SHA256 해시로만 저장하고, 수정·삭제할 때 대조한다.
 * 모든 DB 접근은 서버에서만 일어난다(테이블은 RLS 켜짐 + 정책 없음).
 */

export const BOARD_KEY = "free";
export const PAGE_SIZE = 20;

/** 입력 길이 상한. 초과분은 저장 전에 거른다. */
export const LIMITS = {
  title: 100,
  content: 10000,
  writer: 20,
  password: 100,
  comment: 1000,
} as const;

export interface BoardPost {
  id: number;
  title: string;
  content: string;
  writer: string;
  views: number;
  commentCount: number;
  isNotice: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardComment {
  id: number;
  postId: number;
  content: string;
  writer: string;
  createdAt: string;
}

const POST_LIST_COLUMNS =
  "id,title,writer,views,comment_count,is_notice,created_at,updated_at";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPost(row: any): BoardPost {
  return {
    id: row.id,
    title: row.title ?? "",
    content: row.content ?? "",
    writer: row.writer ?? "",
    views: row.views ?? 0,
    commentCount: row.comment_count ?? 0,
    isNotice: row.is_notice ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toComment(row: any): BoardComment {
  return {
    id: row.id,
    postId: row.post_id,
    content: row.content ?? "",
    writer: row.writer ?? "",
    createdAt: row.created_at,
  };
}

/* -------------------------------------------------------------------------- */
/* 비밀번호                                                                    */
/* -------------------------------------------------------------------------- */

const PBKDF2_ITERATIONS = 100_000;

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, "base64"));
}

async function derive(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      // BufferSource 로 넘기기 위해 뷰가 아닌 버퍼를 준다.
      salt: salt.slice().buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return new Uint8Array(bits);
}

/** `pbkdf2$<반복수>$<salt>$<hash>` 형태로 직렬화한다. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/** 길이가 같을 때만 의미 있는 상수 시간 비교. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.slice().buffer as ArrayBuffer,
      iterations,
      hash: "SHA-256",
    },
    key,
    expected.length * 8,
  );
  return timingSafeEqual(new Uint8Array(bits), expected);
}

/** IP 원본은 저장하지 않는다. 도배 판정에만 쓰는 단방향 해시를 남긴다. */
export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "ssdown";
  const bits = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${salt}:${ip}`),
  );
  return toBase64(new Uint8Array(bits)).slice(0, 24);
}

/* -------------------------------------------------------------------------- */
/* 조회                                                                        */
/* -------------------------------------------------------------------------- */

export async function getPosts(params: {
  page?: number;
  q?: string;
}): Promise<{ posts: BoardPost[]; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;
  const q = params.q?.trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function build(head: boolean): any {
    let qb = supabase
      .from("ssdown_board_posts")
      .select(head ? "id" : POST_LIST_COLUMNS, head ? { count: "exact", head: true } : { count: "exact" })
      .eq("board", BOARD_KEY)
      .is("deleted_at", null);
    if (q) {
      const safe = q.replace(/[%,()]/g, " ");
      qb = qb.or(`title.ilike.%${safe}%,content.ilike.%${safe}%,writer.ilike.%${safe}%`);
    }
    return qb;
  }

  const [{ count, error: countError }, { data, error }] = await Promise.all([
    build(true),
    build(false)
      .order("is_notice", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
  ]);

  if (countError || error || !data) return { posts: [], total: 0 };
  return { posts: data.map(toPost), total: count ?? data.length };
}

export async function getPost(id: number): Promise<BoardPost | null> {
  const { data, error } = await supabase
    .from("ssdown_board_posts")
    .select("*")
    .eq("id", id)
    .eq("board", BOARD_KEY)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return toPost(data);
}

/** 게시글 원본 행. 비밀번호 대조가 필요한 경로에서만 쓴다. */
export async function getPostWithHash(
  id: number,
): Promise<{ post: BoardPost; passwordHash: string } | null> {
  const { data, error } = await supabase
    .from("ssdown_board_posts")
    .select("*")
    .eq("id", id)
    .eq("board", BOARD_KEY)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return { post: toPost(data), passwordHash: data.password_hash };
}

export async function getComments(postId: number): Promise<BoardComment[]> {
  const { data, error } = await supabase
    .from("ssdown_board_comments")
    .select("*")
    .eq("post_id", postId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(toComment);
}

/** 목록의 이전·다음 글. 상세 페이지 하단 이동에 쓴다. */
export async function getAdjacent(
  post: BoardPost,
): Promise<{ prev: { id: number; title: string } | null; next: { id: number; title: string } | null }> {
  const [{ data: newer }, { data: older }] = await Promise.all([
    supabase
      .from("ssdown_board_posts")
      .select("id,title")
      .eq("board", BOARD_KEY)
      .is("deleted_at", null)
      .gt("created_at", post.createdAt)
      .order("created_at", { ascending: true })
      .limit(1),
    supabase
      .from("ssdown_board_posts")
      .select("id,title")
      .eq("board", BOARD_KEY)
      .is("deleted_at", null)
      .lt("created_at", post.createdAt)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  return {
    prev: newer?.[0] ? { id: newer[0].id, title: newer[0].title } : null,
    next: older?.[0] ? { id: older[0].id, title: older[0].title } : null,
  };
}

/** 조회수 +1. 실패해도 페이지 렌더를 막지 않는다. */
export async function bumpViews(id: number, current: number): Promise<void> {
  await supabase
    .from("ssdown_board_posts")
    .update({ views: current + 1 })
    .eq("id", id);
}

/* -------------------------------------------------------------------------- */
/* 도배 방지                                                                   */
/* -------------------------------------------------------------------------- */

/** 같은 IP가 최근 1분 안에 글을 썼는지 본다. */
export async function isRateLimited(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase
    .from("ssdown_board_posts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ipHash)
    .gte("created_at", since);
  return (count ?? 0) > 0;
}
