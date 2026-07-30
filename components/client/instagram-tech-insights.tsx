import { Image, Lock, Clock, Globe } from "lucide-react";

export function InstagramTechInsights() {
  const insights = [
    {
      icon: Image,
      title: "CDN 이미지 최적화",
      content:
        "인스타그램은 데이터 사용량을 줄이려고 미디어를 강하게 압축합니다. 대부분의 이미지는 접속 환경에 따라 프로그레시브 JPEG나 WebP로 제공됩니다. SSDown은 가장 높은 해상도의 후보(Graph API 응답에서 흔히 'original'로 표시됨)를 찾아내, 모바일 전송용 압축이 적용되기 전의 최상 버전을 보관할 수 있게 합니다.",
    },
    {
      icon: Clock,
      title: "서명 URL 만료",
      content:
        "인스타그램 미디어의 직접 주소(CDN URL)에는 시각 정보가 담긴 보안 서명(`?_nc_cat=...`)이 포함됩니다. 이 링크는 일시적이라 보통 몇 시간 안에 만료됩니다. 영상 링크를 그냥 '즐겨찾기'해 둘 수 없는 이유이며, 내려받거나 새로 발급받아야 합니다. SSDown은 요청 시점에 유효한 토큰을 새로 받아 바로 보관할 수 있게 합니다.",
    },
    {
      icon: Lock,
      title: "공개 데이터와 비공개 데이터",
      content:
        "인스타그램의 데이터 구조는 공개 영역과 비공개 영역을 엄격히 나눕니다. 공개 게시물은 일반적인 Graph API 호출이나 HTML 파싱(Open Graph 태그)으로 접근할 수 있지만, 비공개 콘텐츠는 엄격한 세션 인증 뒤에 있습니다. SSDown은 이 구조를 존중하며 비공개 계정의 접근 제어를 우회하려 시도하지 않습니다.",
    },
    {
      icon: Globe,
      title: "지역별 콘텐츠 전송",
      content:
        "인스타그램은 대규모 분산 엣지 네트워크를 사용합니다. 그래서 특정 콘텐츠가 지역 차단되거나 특정 지역 캐시에서 제공되기도 합니다. '끊어진 링크'와 '지역 차단된 자원'을 구분하는 것이 문제 해결의 핵심입니다. SSDown 서버는 가능한 범위에서 이런 지역 차이를 해소해 일관된 접근을 제공하려 합니다.",
    },
  ];

  return (
    <section className="py-3 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="mb-2">
          <span className="inline-block py-1 px-3 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-sm font-semibold mb-4">
            플랫폼 구조
          </span>
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            기술 살펴보기: 인스타그램 미디어 전송
          </h2>
          <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            인스타그램이 수십억 대의 기기에 시각 콘텐츠를 저장하고 보호하며 전달하는 방식을 살펴봅니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-purple-100 dark:hover:border-purple-900 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-purple-500">
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Note */}
        <div className="mt-3 p-6 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-900 dark:text-purple-200">
                개인정보 우선 원칙
              </h4>
              <p className="text-sm text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
                We strictly adhere to ethical data access standards. We do not
                provide tools to view private profiles, download stories
                anonymously from private accounts, or bypass 2FA security. Our
                tools are designed solely for interacting with{" "}
                <strong>공개된 정보</strong> 창작자가 세상에 공개하기로 선택한 것입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
