/**
 * 루트 1depth 를 이미 쓰고 있는 이름들.
 *
 * 소프트웨어 상세 페이지가 `/{slug}` 로 내려오면서, 앱 슬러그는 사이트의 모든
 * 최상위 경로와 같은 공간을 쓰게 됐다. Next.js 는 정적 세그먼트를 동적
 * 세그먼트보다 먼저 잡으므로, 여기 있는 이름을 슬러그로 쓰면 그 앱 페이지는
 * 영영 열리지 않는다(요청이 기존 라우트로 가 버린다).
 *
 * 그래서 임포터·백필 스크립트는 슬러그를 만들 때 반드시 `isReservedSlug()` 로
 * 한 번 걸러야 한다. 걸리면 `-{platform}` 같은 접미사를 붙여 피해 간다.
 *
 * app/ 아래에 새 최상위 라우트를 추가할 때는 이 목록에도 같이 넣는다.
 */
const RESERVED = new Set<string>([
  // 실제 페이지 라우트
  "9gag",
  "about",
  "blog",
  "board",
  "contact",
  "dailymotion",
  "douyin",
  "facebook",
  "instagram",
  "kuaishou",
  "privacy",
  "search",
  "software",
  "terms",
  "tiktok",
  "tools",
  "x",

  // 하위 도구 페이지를 담고 있는 디렉터리(지금은 자기 자신이 페이지가 아니지만,
  // 언제든 목록 페이지가 붙을 수 있으므로 미리 잡아 둔다)
  "file",
  "image",
  "pdf",
  "social-text",
  "utility",
  "video-audio",

  // 라우트 핸들러 · 정적 파일
  "ads.txt",
  "api",
  "app-ads.txt",
  "favicon.ico",
  "llms.txt",
  "manifest.json",
  "robots.txt",
  "rss.xml",
  "sitemap-software.xml",
  "sitemap-static.xml",
  "sitemap.xml",
  "assets",
  "fonts",
  "js",
  "_next",

  // middleware 가 가로채는 레거시 경로
  "kr",

  // 카테고리 · 플랫폼 슬러그. `/software/{slug}` 목록에만 쓰이지만, 루트로
  // 올라올 여지가 있는 이름이라 앱이 선점하지 못하게 막는다.
  "ai",
  "android",
  "browsers",
  "development",
  "education",
  "games",
  "internet",
  "ios",
  "iphone",
  "lifestyle",
  "linux",
  "mac",
  "multimedia",
  "personalization",
  "productivity",
  "security",
  "social",
  "travel",
  "utilities",
  "windows",

  // 상세 페이지의 하위 경로. 슬러그가 이 이름이면 `/download/download` 가 된다.
  "download",

  // 흔히 나중에 필요해지는 이름
  "admin",
  "login",
  "logout",
  "signup",
]);

/** 임포터의 `taken` 집합에 미리 부어 넣을 수 있게 배열로도 낸다. */
export const RESERVED_SLUGS: readonly string[] = [...RESERVED];

/** 이 슬러그를 앱 주소로 쓰면 기존 라우트에 가려지는가. */
export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug.trim().toLowerCase());
}

/**
 * 예약어를 피한 슬러그.
 *
 * 겹치면 플랫폼을 접미사로 붙이고(`pdf` → `pdf-android`), 그래도 겹치면 숫자를
 * 덧붙인다. `taken` 에 이미 쓰인 슬러그를 넘기면 중복까지 함께 피한다.
 */
export function safeSlug(
  slug: string,
  platform: string,
  taken?: Set<string>,
): string {
  const base = slug.trim().toLowerCase();
  const clashes = (s: string) => isReservedSlug(s) || (taken?.has(s) ?? false);
  if (!clashes(base)) return base;

  const suffixed = `${base}-${platform.trim().toLowerCase()}`;
  if (!clashes(suffixed)) return suffixed;

  for (let i = 2; ; i += 1) {
    const candidate = `${suffixed}-${i}`;
    if (!clashes(candidate)) return candidate;
  }
}
