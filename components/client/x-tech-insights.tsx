import { Shield } from "lucide-react";

export function XTechInsights() {
  const insights = [
    {
      icon: NetworkIcon,
      title: "HLS 스트리밍 구조",
      content:
        "일반적인 파일 다운로드와 달리 X(옛 트위터)는 HLS(HTTP Live Streaming) 기술을 사용합니다. 이 적응형 비트레이트 스트리밍 방식은 영상을 작은 조각 파일(.ts)로 나누고 매니페스트 파일(.m3u8)로 관리합니다. 덕분에 재생기가 사용자의 네트워크 상황에 따라 화질을 실시간으로 바꿀 수 있지만, 통째로 '저장'할 원본 파일이 하나로 존재하지 않아 보관용으로 내려받기는 까다로워집니다.",
    },
    {
      icon: CodecIcon,
      title: "영상 압축과 코덱",
      content:
        "X는 수십억 대의 기기에서 재생되도록 주로 H.264/MPEG-4 AVC 영상 압축 표준을 사용합니다. 영상이 업로드되면 모바일 데이터 사용량에 맞춰 비트레이트를 최적화하도록 다시 인코딩됩니다. 트랜스코딩이라 불리는 이 과정에서 하나의 원본으로부터 여러 화질 단계(720x1280, 480x854, 320x568)가 만들어져 다양한 네트워크 환경에 대응합니다.",
    },
    {
      icon: GifIcon,
      title: "'GIF'라는 착각",
      content:
        "X에서 GIF처럼 보이는 것은 실제 GIF 파일인 경우가 드뭅니다. X는 업로드된 GIF를 반복 재생되는 MP4 영상(대개 오디오 없음)으로 변환합니다. 이 변환으로 효율이 낮은 GIF89a 형식 대비 용량이 흔히 95%까지 줄어듭니다. 이런 최적화는 대역폭을 크게 아껴 주지만, 되돌리거나 영상 파일로 제대로 저장하려면 전용 도구가 필요합니다.",
    },
    {
      icon: SecurityIcon,
      title: "안전한 콘텐츠 전송",
      content:
        "X의 콘텐츠는 전 세계 CDN을 통해 전달되며, 비공개 콘텐츠에는 유효 시간이 정해진 토큰이 담긴 서명 URL이 쓰입니다. 공개 콘텐츠는 대체로 접근할 수 있지만, 플랫폼은 서버를 보호하기 위해 엄격한 요청 제한과 수집 방지 조치를 적용합니다. 이런 구조를 알아 두면 일시적인 서비스 장애와 콘텐츠 자체의 이용 불가를 구분하는 데 도움이 됩니다.",
    },
  ];

  return (
    <section className="py-3 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="mb-2">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm font-semibold mb-4">
            기술 심층 분석
          </span>
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            기술 들여다보기: X 영상 기술
          </h2>
          <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            X의 영상 전송 시스템이 어떤 구조로 되어 있는지 알면, 콘텐츠를 효율적으로 관리하는 데 왜 전용 도구가 필요한지 이해할 수 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400">
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
        <div className="mt-3 p-6 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">
                콘텐츠 안전 측면에서 중요한 이유
              </h4>
              <p className="text-sm text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                제대로 된 디지털 보관을 위해서는 이러한 기술 형식을 이해하는 것이 중요합니다. 화면 녹화로 저장하면 재압축에 따른 화질 손상(세대 손실)이 생기기 쉽습니다. SSDown 같은 도구로 원본 스트림에 접근하면 플랫폼 CDN이 제공하는 원본 화질을 그대로 보존할 수 있어, 개인 디지털 아카이브의 완전성을 지킬 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}

function CodecIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m10 10-2 2v2c0 1.1.9 2 2 2h6a2 2 0 0 0 2-2v-2l-2-2" />
      <path d="M18 4h3" />
      <path d="M18 20h3" />
      <path d="M4 20h3" />
      <path d="M4 4h3" />
      <rect x="8" y="2" width="8" height="20" rx="2" />
    </svg>
  );
}

function GifIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18V8a2 2 0 0 1 2-2h4" />
      <path d="M6 14h4" />
      <path d="M10 16v2" />
      <path d="M13 18h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2v8Z" />
      <path d="M21 8h-3v8h3" />
      <path d="M21 12h-2" />
    </svg>
  );
}

function SecurityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
