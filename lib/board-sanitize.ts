import sanitizeHtml from "sanitize-html";

/**
 * 게시판 본문 HTML 정제.
 *
 * 익명 게시판이므로 들어오는 HTML 은 전부 적대적이라고 본다. 허용 목록에 없는
 * 태그·속성은 남기지 않는다. 이 함수는 반드시 서버(API 라우트)에서 저장 직전에
 * 호출한다 — 브라우저에서만 거르면 API 를 직접 때려 우회할 수 있다.
 *
 * 일부러 뺀 것들:
 *  - `style` 속성과 `<style>`: CSS 로 화면을 덮거나 다른 요소를 가릴 수 있다.
 *  - `<iframe>`·`<object>`·`<embed>`·`<form>`·`<input>`: 외부 삽입과 피싱 통로.
 *  - `on*` 이벤트 속성: sanitize-html 이 허용 목록 밖이라 자동으로 제거한다.
 *  - `id`: 앵커를 가로챌 수 있다.
 *  - `class`: 사이트 CSS 를 끌어다 쓸 수 있어 기본은 제거한다. 다만 본문 안
 *    강조 버튼용으로 ALLOWED_LINK_CLASSES 에 등록한 값만 예외로 남긴다.
 */

/** 본문 링크에 허용하는 class 값. 여기 없는 값은 제거된다. */
const ALLOWED_LINK_CLASSES = new Set(["cta"]);
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "strong", "b", "em", "i", "u", "s", "del", "ins", "mark", "sub", "sup",
    "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    "span", "div",
  ],
  // transformTags 로 붙인 속성도 이 목록을 통과해야 살아남는다.
  // (sanitize-html 은 변환을 먼저 하고 속성 필터를 나중에 적용한다)
  allowedAttributes: {
    a: ["href", "title", "target", "rel", "class"],
    img: ["src", "alt", "width", "height", "loading", "referrerpolicy"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan", "scope"],
  },
  // http/https/mailto 만 남긴다. javascript: 와 data: 는 차단된다.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  // 허용 목록 밖 태그는 껍데기만 벗기고 안쪽 글자는 남긴다.
  disallowedTagsMode: "discard",
  nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  // class 는 아래 허용 목록에 있는 값만 남긴다(transformTags 에서 걸러낸다).
  transformTags: {
    // 바깥으로 나가는 링크는 새 창 + 참조 차단 + 검색엔진 신뢰 차단.
    a: (tagName, attribs) => {
      // 임의 클래스는 버리고 사이트가 정한 값만 남긴다.
      const { class: incoming, ...rest } = attribs;
      const next: sanitizeHtml.Attributes = {
        ...rest,
        target: "_blank",
        rel: "nofollow ugc noopener noreferrer",
      };
      if (incoming && ALLOWED_LINK_CLASSES.has(incoming)) next.class = incoming;
      return { tagName, attribs: next };
    },
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: "lazy", referrerpolicy: "no-referrer" },
    }),
    // h1 은 페이지 제목 몫이므로 본문에서는 h2 로 낮춘다.
    h1: "h2",
  },
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}

/**
 * 목록·메타 설명에 쓸 순수 텍스트. 태그를 걷어내고 공백을 한 칸으로 줄인다.
 */
export function htmlToText(html: string): string {
  const stripped = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  // sanitize-html 은 엔티티를 그대로 두므로 자주 쓰는 것만 되돌린다.
  return stripped
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 정제 후 실제 내용이 있는지 본다. `<p></p>` 만 남은 빈 글을 막는다.
 */
export function hasVisibleContent(html: string): boolean {
  if (/<img\b/i.test(html)) return true;
  return htmlToText(html).length > 0;
}
