import { SoftwareApplication } from '@/types/app';

export const mockApps: Record<string, SoftwareApplication> = {
  'mac-desmume': {
    core: {
      id: "desmume",
      slug: "desmume",
      name: "DeSmuME",
      version: "v0.9.11",
      platform: "Mac",
      supportedPlatforms: ["Windows", "Mac", "Linux"],
      developer: { name: "DeSmuME Team", websiteUrl: "http://desmume.org/" },
      category: { main: "게임", sub: "에뮬레이터" }
    },
    seo: {
      title: "DeSmuME Mac용 무료 다운로드 - 2026 최신 버전",
      description: "Mac 환경에서 닌텐도 DS(Nintendo DS) 게임을 원활하게 플레이할 수 있도록 도와주는 무료 오픈소스 에뮬레이터입니다.",
      keywords: ["Mac 에뮬레이터", "NDS 에뮬", "DeSmuME 다운로드"],
      ogImage: "https://via.placeholder.com/1200x630.png?text=DeSmuME+Mac",
      structuredData: {}
    },
    download: {
      downloadUrl: "#",
      fileSize: "15.2 MB",
      license: "Open Source",
      security: {
        status: "Safe",
        lastScannedAt: new Date().toISOString(),
        scanProvider: "VirusTotal"
      }
    },
    rating: {
      average: 4.5,
      totalCount: 12500,
      editorScore: 4.8
    },
    content: {
      iconUrl: "https://via.placeholder.com/150",
      screenshotUrls: [
        "https://via.placeholder.com/600x400?text=Screenshot+1",
        "https://via.placeholder.com/600x400?text=Screenshot+2"
      ],
      shortSummary: "Mac 환경에서 닌텐도 DS(Nintendo DS) 게임을 원활하게 플레이할 수 있도록 도와주는 무료 오픈소스 에뮬레이터입니다.",
      editorReviewHtml: "",
      aiReviewHtml: "",
      bodyHtml: `
        <p><strong>DeSmuME</strong>는 Mac 환경에서 닌텐도 DS(Nintendo DS) 게임을 원활하게 플레이할 수 있도록 도와주는 무료 오픈소스 <strong>에뮬레이터</strong>입니다. 복잡한 설정 없이도 뛰어난 호환성과 다양한 편의 기능을 제공하여, 고전 게임 팬들에게 가장 인기 있는 선택지 중 하나입니다.</p>
        <h3 class="text-xl font-bold mt-6 mb-4">🚀 DeSmuME 주요 시스템 및 기능</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>그래픽 및 디스플레이 제어:</strong> 듀얼 스크린 중 어느 화면을 렌더링할지 선택하거나, 해상도 스케일링을 지원합니다.</li>
          <li><strong>세이브 및 로드 최적화:</strong> 자체 퀵 세이브/로드(Save States) 10개 슬롯을 제공합니다.</li>
          <li><strong>치트(Cheat) 시스템 지원:</strong> 각종 치트 코드를 파일에 직접 연동할 수 있습니다.</li>
        </ul>
        <h3 class="text-xl font-bold mt-6 mb-4">💡 총평: Mac 최고의 NDS 에뮬레이터</h3>
        <p>DeSmuME는 Mac 사용자라면 필수적으로 고려해야 할 가장 안정적인 닌텐도 DS 에뮬레이터입니다. 완벽한 퍼포먼스와 한글화된 커뮤니티 지원으로 고전 게임을 위한 최적의 앱입니다.</p>
      `,
      pros: [
        "뛰어난 닌텐도 DS 게임 호환성 및 쾌적한 실행 속도",
        "상태 저장(Save State) 기능을 통한 편리함",
        "화면 레이아웃 커스터마이징 및 듀얼 스크린 완벽 지원",
        "완전 무료 및 오픈소스(GPL) 라이선스"
      ],
      cons: [
        "와이파이(Wi-Fi) 멀티플레이어 기능 미지원",
        "오래된 Mac 기기에서는 프레임 드랍 발생 가능성"
      ],
      features: [
        "마이크 에뮬레이션",
        "비디오/오디오 녹화 가능",
        "치트 코드 매니저",
        "키보드 및 게임패드 매핑"
      ],
      faq: []
    },
    specs: {
      osRequirements: "macOS 10.12 Sierra 이상",
      languages: ["한국어", "영어", "일본어"],
      lastUpdatedDate: new Date('2025-10-14').toISOString()
    },
    relations: {
      alternativesAppIds: ["dsmplay", "openemu"],
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2025-10-14').toISOString()
  },
  'windows-chrome': {
    core: {
      id: "chrome",
      slug: "chrome",
      name: "Google Chrome",
      version: "v123.0.0",
      platform: "Windows",
      supportedPlatforms: ["Windows", "Mac", "Android", "iOS", "Linux"],
      developer: { name: "Google", websiteUrl: "https://google.com/chrome" },
      category: { main: "유틸리티", sub: "웹 브라우저" }
    },
    seo: {
      title: "Google Chrome Windows 무료 다운로드 - 가장 빠른 브라우저",
      description: "Google이 만든 빠르고 안전한 무료 웹 브라우저입니다.",
      keywords: ["크롬 다운로드", "웹 브라우저", "Google Chrome"],
      ogImage: "https://via.placeholder.com/1200x630.png?text=Chrome+Windows",
      structuredData: {}
    },
    download: {
      downloadUrl: "#",
      fileSize: "85.0 MB",
      license: "Free",
      security: {
        status: "Safe",
        lastScannedAt: new Date().toISOString(),
        scanProvider: "Windows Defender"
      }
    },
    rating: {
      average: 4.8,
      totalCount: 5200000,
      editorScore: 4.9
    },
    content: {
      iconUrl: "https://via.placeholder.com/150",
      screenshotUrls: [
        "https://via.placeholder.com/600x400?text=Chrome+1",
      ],
      shortSummary: "Google이 만든 빠르고 안전한 무료 웹 브라우저입니다. 확장 프로그램으로 무한한 기능을 더하세요.",
      editorReviewHtml: "",
      aiReviewHtml: "",
      bodyHtml: `
        <p><strong>Google Chrome</strong>은 전 세계에서 가장 많이 사용되는 웹 브라우저입니다. 빠르고 간결한 디자인, 뛰어난 보안 기능, 구글 생태계와의 완벽한 연동을 자랑합니다.</p>
      `,
      pros: ["압도적인 브라우징 속도", "방대한 확장 프로그램 생태계", "강력한 보안 및 동기화"],
      cons: ["램(RAM) 메모리 사용량이 다소 높음"],
      features: ["비밀번호 관리자 내장", "악성 사이트 차단", "빠른 구글 검색 연동"],
      faq: []
    },
    specs: {
      osRequirements: "Windows 10/11 64-bit",
      languages: ["한국어", "영어", "다국어"],
      lastUpdatedDate: new Date().toISOString()
    },
    relations: {
      alternativesAppIds: ["firefox", "edge", "brave"],
    },
    createdAt: new Date('2020-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  }
};

export function getMockApp(os: string, name: string): SoftwareApplication | null {
  const key = `${os.toLowerCase()}-${name.toLowerCase()}`;
  return mockApps[key] || null;
}
