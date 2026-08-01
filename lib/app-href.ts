import type { SoftwareApplication } from "@/types/app";

/**
 * 앱 상세 페이지 경로.
 *
 * DB 의 `slug` 는 이미 `/windows/teamviewer` 처럼 플랫폼 경로를 포함한다.
 * 앞에 플랫폼을 한 번 더 붙이면 `/software/windows//windows/teamviewer` 가 되어
 * 404 가 나므로, 링크를 만들 때는 반드시 이 함수를 쓴다.
 *
 * supabase 를 끌어오지 않도록 app-utils 와 분리해 둔다. 클라이언트 컴포넌트에서도
 * 안전하게 import 할 수 있어야 한다.
 */
export function buildAppHref(app: SoftwareApplication): string {
  if (app.core.slug) return `/software${app.core.slug}`;

  const platform =
    app.core.platform.toLowerCase() === "ios"
      ? "iphone"
      : app.core.platform.toLowerCase();
  return `/software/${platform}/${app.core.id.toLowerCase()}`;
}
