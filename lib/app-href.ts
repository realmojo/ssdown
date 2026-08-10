import type { SoftwareApplication } from "@/types/app";

/** 배포처 링크의 종류. 버튼 문구를 여기에 맞춰 고른다. */
export type DistributionKind = "download" | "homepage";

export interface Distribution {
  url: string;
  kind: DistributionKind;
}

/**
 * 바깥으로 내보낼 수 있는 주소만 통과시킨다.
 *
 * DB 의 `download_url` 은 링크가 없을 때 `"#"` 가 들어간다(import 스크립트들이
 * 그렇게 넣는다). 스크래핑 값이라 상대 경로나 `javascript:` 같은 쓰레기가 섞일
 * 수도 있으므로 http(s) 절대 주소만 인정한다.
 * 판정 기준은 scripts/check-download-urls.ts 와 같다.
 */
function asExternalUrl(raw?: string): string | undefined {
  const t = (raw ?? "").trim();
  if (!t || t === "#") return undefined;
  return /^https?:\/\/\S+$/i.test(t) ? t : undefined;
}

/**
 * 이 앱을 실제로 받을 수 있는 바깥 주소.
 *
 *  1) `download_url`            — 배포 파일·스토어로 바로 가는 주소
 *  2) 개발사 홈페이지            — 1) 이 없을 때의 대안
 *
 * 둘 다 쓸 수 없으면 `undefined`. 이때는 안내할 배포처 자체가 없으므로,
 * 상세 페이지에서 진입 버튼을 숨기고 안내 페이지도 404 로 내보낸다.
 * 다운로드를 약속해 놓고 아무것도 주지 않는 페이지가 남지 않게 하기 위함이다.
 *
 * 홈페이지로 폴백한 경우 `kind` 가 `"homepage"` 가 된다. 파일로 바로 가는
 * 주소가 아니므로 버튼 문구도 "내려받기"가 아닌 "이동"으로 바꿔야 한다.
 */
export function resolveDistribution(
  app: SoftwareApplication,
): Distribution | undefined {
  const direct = asExternalUrl(app.download.downloadUrl);
  if (direct) return { url: direct, kind: "download" };

  const site = asExternalUrl(app.core.developer.websiteUrl);
  if (site) return { url: site, kind: "homepage" };

  return undefined;
}

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
