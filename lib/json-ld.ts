/**
 * `<script type="application/ld+json">` 안에 넣어도 안전한 JSON 문자열을 만든다.
 *
 * HTML 파서는 스크립트 본문에서 `</script>` 를 만나면 그 자리에서 블록을 끝낸다.
 * 그래서 사용자·외부에서 들어온 문자열이 그대로 직렬화되면 태그를 빠져나가
 * 임의의 마크업을 심을 수 있다. `<`, `>`, `&` 를 유니코드 이스케이프로 바꾸면
 * JSON 값으로서의 의미는 그대로면서 파서가 태그로 읽지 않는다.
 *
 * U+2028·U+2029 는 JSON 에서는 허용되지만 자바스크립트 소스에서는 줄바꿈으로
 * 취급되므로 함께 처리한다.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
