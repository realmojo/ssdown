import { Share2, Lock, MonitorPlay, Wifi } from "lucide-react";

export function FacebookTechInsights() {
  const insights = [
    {
      icon: MonitorPlay,
      title: "DASH 스트리밍 방식",
      content:
        "Facebook utilizes DASH (Dynamic Adaptive Streaming over HTTP) for most HD content. This protocol splits video and audio into separate tracks to adapt to fluctuating network speeds. Simple 'right-click save' methods fail because the browser only sees the manifests, not the full file. SSDown's engine identifies and merges these separate tracks into a unified MP4 container for offline playback.",
    },
    {
      icon: Wifi,
      title: "비트레이트 제한과 HD 전송",
      content:
        "수십억 명에게 서비스하기 위해 페이스북은 일반 영상의 비트레이트에 상한을 둡니다. 페이스북에서 'HD'는 대개 720p를 뜻하며, 1080p는 특정 '워치' 콘텐츠나 게임 방송에만 제공됩니다. SSDown은 매니페스트 파일을 분석해 제공되는 가장 높은 비트레이트 스트림을 찾아내, 원본 서버가 제공하는 최고 화질을 받을 수 있게 합니다.",
    },
    {
      icon: Share2,
      title: "공개 그래프 데이터 접근",
      content:
        "저희 시스템은 공개된 Open Graph 인터페이스만 이용합니다. 영상이 '전체 공개'로 설정되면 메타데이터와 CDN 주소를 일반적인 HTML 파싱으로 확인할 수 있습니다. 이 점이 해킹(무단 접근)과 아카이빙(공개된 데이터의 보존)을 명확히 구분해 주며, 저희 운영이 윤리적이고 합법적으로 유지되도록 합니다.",
    },
    {
      icon: Lock,
      title: "비공개 그룹 보안",
      content:
        "비공개 페이스북 그룹이나 개인 프로필의 콘텐츠는 특정 사용자의 로그인 쿠키에 묶인 세션 기반 인증 토큰으로 보호됩니다. SSDown은 이러한 보안 조치의 우회를 지원하지 않습니다. 공개 설정은 존중되어야 한다고 믿기에, 비공개 콘텐츠를 수집하거나 내려받는 도구는 만들지 않습니다.",
    },
  ];

  return (
    <section className="py-3 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="mb-2">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-semibold mb-4">
            기술 들여다보기
          </span>
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            페이스북 영상 기술 설명
          </h2>
          <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            DASH 프로토콜과 페이스북이 대규모 영상 전송을 처리하는 방식을 살펴봅니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-blue-600 dark:text-blue-400">
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
        <div className="mt-3 p-6 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-start gap-4">
            <Share2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                연구 목적 보관
              </h4>
              <p className="text-sm text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                소셜 미디어 콘텐츠는 언제든 사라질 수 있습니다. 오늘 볼 수 있던 영상이 플랫폼 정책 변경이나 계정 정지로 내일 사라질 수 있습니다. 디지털 아카이빙을 하는 사람들은 SSDown 같은 도구로 문화적으로 의미 있는 콘텐츠, 뉴스 영상, 개인의 추억을 클라우드 플랫폼의 불확실성으로부터 지켜, 기록이 404 오류로 사라지지 않게 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
