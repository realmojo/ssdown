/**
 * 포털 내비게이션 단일 출처.
 *
 * 헤더 메뉴, 좌측 카테고리 사이드바, 도구 허브 페이지가 모두 이 데이터를 읽는다.
 * 라벨을 여기서만 고치면 세 곳에 함께 반영된다.
 */

export interface NavItem {
  href: string;
  label: string;
}

export interface NavGroup {
  key: string;
  label: string;
  hub: string;
  items: NavItem[];
}

/** 도구 카테고리 (79개 도구). */
export const TOOL_GROUPS: NavGroup[] = [
  {
    key: "image",
    label: "이미지",
    hub: "/tools/image",
    items: [
      { href: "/image/image-metadata-viewer", label: "메타데이터 보기" },
      { href: "/image/pixelate-image", label: "모자이크 처리" },
      { href: "/image/background-remover", label: "배경 제거" },
      { href: "/image/color-palette-extractor", label: "색상 팔레트" },
      { href: "/image/social-image-resizer", label: "소셜 이미지 크기 변환" },
      { href: "/image/thumbnail-generator", label: "썸네일 생성기" },
      { href: "/image/icon-to-png", label: "아이콘 → PNG" },
      { href: "/image/watermark-remover", label: "워터마크 제거" },
      { href: "/image/round-image-maker", label: "원형 이미지" },
      { href: "/image/flip-image", label: "이미지 뒤집기" },
      { href: "/image/image-converter", label: "이미지 변환" },
      { href: "/image/image-compressor", label: "이미지 압축" },
      { href: "/image/crop-image", label: "이미지 자르기" },
      { href: "/image/combine-images", label: "이미지 합치기" },
      { href: "/image/blur-image", label: "이미지 흐리게" },
      { href: "/image/collage-maker", label: "콜라주 만들기" },
      { href: "/image/add-border-to-image", label: "테두리 추가" },
      { href: "/image/add-text-to-image", label: "텍스트 추가" },
      { href: "/image/favicon-generator", label: "파비콘 생성기" },
      { href: "/image/black-and-white", label: "흑백 변환" },
    ],
  },
  {
    key: "pdf",
    label: "PDF",
    hub: "/tools/pdf",
    items: [
      { href: "/pdf/images-to-pdf", label: "이미지 → PDF" },
      { href: "/pdf/delete-pdf-pages", label: "페이지 삭제" },
      { href: "/pdf/pdf-to-text", label: "PDF → 텍스트" },
      { href: "/pdf/pdf-to-jpg", label: "PDF → JPG" },
      { href: "/pdf/pdf-to-png", label: "PDF → PNG" },
      { href: "/pdf/create-pdf", label: "PDF 만들기" },
      { href: "/pdf/protect-pdf", label: "PDF 보호" },
      { href: "/pdf/split-pdf", label: "PDF 분할" },
      { href: "/pdf/compress-pdf", label: "PDF 압축" },
      { href: "/pdf/pdf-watermark", label: "PDF 워터마크" },
      { href: "/pdf/crop-pdf", label: "PDF 자르기" },
      { href: "/pdf/unlock-pdf", label: "PDF 잠금 해제" },
      { href: "/pdf/esign-pdf", label: "PDF 전자 서명" },
      { href: "/pdf/add-text-to-pdf", label: "PDF 텍스트 추가" },
      { href: "/pdf/pdf-page-numbers", label: "PDF 페이지 번호" },
      { href: "/pdf/rearrange-pdf", label: "PDF 페이지 재배열" },
      { href: "/pdf/pdf-editor", label: "PDF 편집기" },
      { href: "/pdf/merge-pdf", label: "PDF 합치기" },
      { href: "/pdf/rotate-pdf", label: "PDF 회전" },
    ],
  },
  {
    key: "video-audio",
    label: "영상·오디오",
    hub: "/tools/video-audio",
    items: [
      { href: "/video-audio/silence-remover", label: "무음 제거" },
      { href: "/video-audio/video-to-gif", label: "영상 → GIF" },
      { href: "/video-audio/video-to-mp3", label: "영상 → MP3" },
      { href: "/video-audio/video-converter", label: "영상 변환" },
      { href: "/video-audio/video-compressor", label: "영상 압축" },
      { href: "/video-audio/mute-video", label: "영상 음소거" },
      { href: "/video-audio/trim-video", label: "영상 자르기" },
      { href: "/video-audio/audio-converter", label: "오디오 변환" },
      { href: "/video-audio/audio-trimmer", label: "오디오 자르기" },
      { href: "/video-audio/video-frame-extractor", label: "프레임 추출" },
      { href: "/video-audio/gif-to-mp4", label: "GIF → MP4" },
    ],
  },
  {
    key: "file",
    label: "파일 변환",
    hub: "/tools/file",
    items: [
      { href: "/file/excel-to-csv", label: "엑셀 → CSV" },
      { href: "/file/excel-to-pdf", label: "엑셀 → PDF" },
      { href: "/file/excel-to-xml", label: "엑셀 → XML" },
      { href: "/file/split-excel", label: "엑셀 분할" },
      { href: "/file/csv-to-excel", label: "CSV → 엑셀" },
      { href: "/file/csv-to-json", label: "CSV → JSON" },
      { href: "/file/csv-to-xml", label: "CSV → XML" },
      { href: "/file/split-csv", label: "CSV 분할" },
      { href: "/file/json-to-xml", label: "JSON → XML" },
      { href: "/file/xml-to-excel", label: "XML → 엑셀" },
      { href: "/file/xml-to-csv", label: "XML → CSV" },
      { href: "/file/xml-to-json", label: "XML → JSON" },
    ],
  },
  {
    key: "utility",
    label: "유틸리티",
    hub: "/tools/utility",
    items: [
      { href: "/utility/word-counter", label: "글자 수 세기" },
      { href: "/utility/text-case-converter", label: "대소문자 변환기" },
      { href: "/utility/lorem-ipsum-generator", label: "로렘 입숨" },
      { href: "/utility/password-generator", label: "비밀번호 생성기" },
      { href: "/utility/color-converter", label: "색상 변환기" },
      { href: "/utility/timestamp-converter", label: "타임스탬프 변환기" },
      { href: "/utility/diff-checker", label: "텍스트 비교기" },
      { href: "/utility/aspect-ratio-calculator", label: "화면비 계산기" },
      { href: "/utility/base64-url-encoder", label: "Base64 / URL 인코더" },
      { href: "/utility/json-formatter", label: "JSON 포매터" },
      { href: "/utility/mp3-splitter", label: "MP3 분할기" },
      { href: "/utility/og-debugger", label: "OG 태그 검사기" },
      { href: "/utility/qr-code-generator", label: "QR 코드 생성기" },
      { href: "/utility/qr-code-scanner", label: "QR 코드 스캐너" },
      { href: "/utility/uuid-generator", label: "UUID 생성기" },
    ],
  },
  {
    key: "social-text",
    label: "소셜·텍스트",
    hub: "/tools/social-text",
    items: [
      { href: "/social-text/instagram-line-break", label: "인스타그램 줄바꿈" },
      { href: "/social-text/hashtag-generator", label: "해시태그 생성기" },
    ],
  },
];

/** 다운로더. */
export const DOWNLOADER_ITEMS: NavItem[] = [
  { href: "/x", label: "X (트위터)" },
  { href: "/tiktok", label: "틱톡" },
  { href: "/instagram", label: "인스타그램" },
  { href: "/facebook", label: "페이스북" },
  { href: "/dailymotion", label: "데일리모션" },
  { href: "/9gag", label: "9GAG" },
  { href: "/douyin", label: "더우인" },
  { href: "/kuaishou", label: "콰이쇼우" },
];

/** 소프트웨어 플랫폼. */
export const PLATFORM_ITEMS: NavItem[] = [
  { href: "/software/windows", label: "Windows" },
  { href: "/software/mac", label: "Mac" },
  { href: "/software/android", label: "안드로이드" },
  { href: "/software/iphone", label: "iPhone" },
  { href: "/software/linux", label: "Linux" },
];

/** 헤더 1차 메뉴. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/tools", label: "도구" },
  { href: "/software", label: "소프트웨어" },
  { href: "/blog", label: "블로그" },
  { href: "/board", label: "자유게시판" },
  { href: "/search", label: "검색" },
];

/** 커뮤니티 메뉴. 지금은 자유게시판 하나다. */
export const COMMUNITY_ITEMS: NavItem[] = [
  { href: "/board", label: "자유게시판" },
  { href: "/board/write", label: "글쓰기" },
];

/** 전체 도구를 평탄화한 목록. 검색·인기 목록에서 쓴다. */
export const ALL_TOOLS: NavItem[] = TOOL_GROUPS.flatMap((g) => g.items);

/** 경로로 소속 그룹을 찾는다. 사이드바 활성 표시에 쓴다. */
export function groupForPath(pathname: string): NavGroup | undefined {
  return TOOL_GROUPS.find(
    (g) => pathname.startsWith(`/${g.key}/`) || pathname === g.hub,
  );
}
