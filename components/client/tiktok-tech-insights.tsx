import { Layers, Smartphone, Music, Shield } from "lucide-react";

export function TikTokTechInsights() {
  const insights = [
    {
      icon: Layers,
      title: "워터마크 합성 구조",
      content:
        "TikTok's 'watermark' is not permanently baked into the original video file on their servers. Instead, it is applied as a dynamic overlay layer during playback or when using the official 'Save Video' function. SSDown accesses the underlying source stream (the 'clean' version) before this overlay process occurs, allowing for the retrieval of the pristine, watermark-free video file directly from the Content Delivery Network (CDN).",
    },
    {
      icon: Smartphone,
      title: "세로 영상과 HEVC 최적화",
      content:
        "TikTok heavily relies on the H.265 (HEVC) codec for newer devices to maintain high quality (1080p) at lower bitrates, specifically optimized for vertical (9:16 aspect ratio) mobile viewing. While this codec saves data, it can cause compatibility issues on older desktop players. Our service ensures the retrieved MP4 container is compatible with standard playback software while preserving the original high-efficiency encoding.",
    },
    {
      icon: Music,
      title: "오디오 트랙 분리",
      content:
        "Validation of audio integrity is a complex part of the TikTok ecosystem. Often, a video's visual track and audio track are streamed separately and synchronized by the client app. This separation allows for 'Sound Removals' due to copyright strikes without deleting the video. SSDown's extraction engine merges these separate streams back into a single cohesive MP4 file, ensuring audio-visual synchronization.",
    },
    {
      icon: Shield,
      title: "알고리즘 기반 ID 추적",
      content:
        "공식 앱으로 내려받은 모든 영상에는 메타데이터 태그와 눈에 보이지 않는 알고리즘 ID가 담겨 출처의 디지털 흔적을 남깁니다. 이는 틱톡 추천 엔진 추적의 일부입니다. 외부 도구로 보관이나 오프라인 시청을 위해 내려받으면 이 메타데이터는 대개 제거되거나 변경되어, 파일이 알고리즘 피드와 분리됩니다.",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 text-sm font-semibold mb-4">
            기술 분석
          </span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            틱톡 영상 인프라 들여다보기
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            틱톡이 영상 전송과 워터마크, 오디오 스트림을 어떻게 처리하는지, 그리고 깨끗한 다운로드가 가능한 기술적 배경을 자세히 살펴봅니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-pink-100 dark:hover:border-pink-900 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-pink-500">
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
        <div className="mt-12 p-6 rounded-xl bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-pink-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-pink-900 dark:text-pink-200">
                저작권과 이용에 관한 안내
              </h4>
              <p className="text-sm text-pink-800/80 dark:text-pink-300/80 leading-relaxed">
                While technology allows for the removal of visual watermarks, it
                does not remove the{" "}
                <strong>지식재산권</strong> 원작자에게 있습니다. 워터마크 없는 영상은 개인적인 보관이나 허용된 범위의 창작적 재활용(예: 공정 이용에 해당하는 비평)을 위한 것입니다. 타인의 작업물을 출처 없이 자기 것처럼 재배포하는 행위는 저작권법과 플랫폼 약관 위반입니다. 다시 게시하기 전에는 반드시 동의를 구하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
