/**
 * `ssdown_blogs.category` 는 영문 슬러그로 저장된다. 화면에는 한국어만 노출하므로
 * 이 표를 거쳐 라벨을 얻는다. 표에 없는 값은 슬러그를 그대로 보여준다.
 */
export const BLOG_CATEGORY_KR: Record<string, string> = {
  guide: "가이드",
  trends: "트렌드",
  instagram: "인스타그램",
  tech: "기술",
  tips: "활용팁",
  security: "보안",
  strategy: "전략",
  general: "일반",
};

export function blogCategoryLabel(slug?: string): string {
  if (!slug) return "";
  return BLOG_CATEGORY_KR[slug] ?? slug;
}

/**
 * 한국어로 번역된 글만 노출한다. 사이트맵(`app/sitemap-static.xml`)과 같은 기준이라
 * 번역이 채워지면 목록과 색인에 자동으로 함께 편입된다.
 */
export function isKoreanPost(title: unknown): boolean {
  return /[가-힣]/.test(String(title ?? ""));
}
