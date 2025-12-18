import { Post } from "./types";

export const post: Post = {
  id: "ssdown-speed-update-2024",
  title: {
    en: "Under the Hood: How We Made SSDown 3x Faster in 2024 (Infrastructure Update)",
    kr: "엔지니어링 노트: SSDown이 2024년에 3배 더 빨라진 기술적 비결 (인프라 대규모 업데이트)",
  },
  excerpt: {
    en: "We don't just 'fix' bugs; we rewrite engines. Dive deep into our new distributed server architecture, Bilibili optimization logic, and global CDN expansion.",
    kr: "단순한 버그 수정이 아닙니다. 엔진을 갈아엎었습니다. 분산 서버 아키텍처 도입, 비리비리 병합 로직 최적화, 그리고 글로벌 CDN 확장에 대한 기술 리포트.",
  },
  content: {
    en: `
## The Need for Speed

In the world of video downloading, a delay of 5 seconds feels like an eternity. As SSDown grew from a small utility to a global platform with users from Brazil to South Korea, our monolith server architecture started to show cracks. During peak hours (Saturday nights in Asia / Sunday mornings in US), processing times for 4K videos were unacceptable.

We decided to stop patching holes and rebuild our core infrastructure. Here is what changed.

---

## 1. Global Edge Nodes (CDN Expansion)

Previously, all requests were routed to our central servers in the US. This meant a user in Tokyo had to send a request across the Pacific Ocean, wait for processing, and receive the file back. The latency (ping) alone was 200ms+.

**The Upgrade**:
We have deployed **"Edge Worker Nodes"** in strategic locations:
*   **Tokyo (JP)**: Handling East Asia traffic (Korea, Japan).
*   **Singapore (SG)**: Handling Southeast Asia.
*   **Frankfurt (DE)**: Serving Europe.
*   **São Paulo (BR)**: Serving South America.

**The Result**:
*   Latency reduced by **70%**.
*   Download speeds are no longer capped by trans-oceanic cable bandwidth. You download from a server near you.

---

## 2. The "Bilibili Engine" Rewrite

Bilibili is notoriously difficult to download from. They separate audio (.m4a) and video (.m4v) tracks to save bandwidth. To give you a playable MP4, we have to download both and "stitch" them together (a process called Remuxing) using FFmpeg.

**The Problem**:
FFmpeg is CPU intensive. When 1,000 users downloaded Bilibili videos simultaneously, our CPUs hit 100% usage, creating a queue.

**The Solution**:
We implemented a **GPU-Accelerated Transcoding Pipeline**.
*   We moved the remuxing task from general-purpose CPUs to specialized transcoding cards.
*   We optimized the buffer size to process streams in chunks rather than waiting for the whole file.
*   **Performance Gain**: 1080p/60fps videos from Bilibili now process **4x faster**.

---

## 3. TikTok & Instagram: Adaptive Parsing

Social media platforms are constantly fighting scrapers. They change their HTML structure, obfuscate their JavaScript, and rotate API keys daily.
Previously, when TikTok updated their code, SSDown would go down for 2-3 hours while our engineers manually fixed the scraper.

**The Evolution**:
We built an **AI-Assisted Parser**.
*   Our system continuously monitors the target sites.
*   If it detects a change (e.g., download failure rate spikes > 1%), it automatically attempts to identify the new pattern using machine learning models trained on thousands of page variants.
*   It can often "self-heal" and adapt to minor code changes without human intervention.
*   This means **99.9% Uptime** for you.

---

## 4. Bandwidth Upgrade

We negotiated new transit agreements with Tier-1 network providers.
*   **Old Capacity**: 1 Gbps port per server.
*   **New Capacity**: **10 Gbps port** per server.

Even if you are on a Gigabit Fiber connection at home, SSDown can now fully saturate your internet speed. You can download a 1GB file in seconds.

---

## What's Next? (Roadmap)

We are not done. Here is what we are working on for Late 2024:
*   **8K Support**: YouTube allows 8K AV1 streams. We are testing the hardware required to process these massive files.
*   **Batch Downloading**: The ability to paste a link to a TikTok profile and download *all* their videos at once (Premium feature concept).
*   **Cloud Drive Integration**: Save directly to your Google Drive or Dropbox without downloading to your device first.

---

## A Note of Thanks

Infrastructure costs money. Bandwidth costs money. Yet, SSDown remains free. This is possible because of our loyal users who disable ad-blockers or share our site with friends. Your support fuels these upgrades.

Enjoy the speed.
    `,
    kr: `
## 속도에 대한 갈증

비디오 다운로드의 세계에서 5초의 지연은 영겁의 시간처럼 느껴집니다. SSDown이 소소한 도구에서 브라질부터 한국까지 전 세계 유저가 사용하는 글로벌 플랫폼으로 성장하면서, 저희의 초기 단일 서버 아키텍처는 한계를 드러내기 시작했습니다. 특히 트래픽이 몰리는 피크 시간대(아시아의 토요일 밤 / 미국의 일요일 아침)에는 4K 영상 처리 속도가 현저히 느려졌습니다.

저희는 구멍을 때우는 식의 패치를 멈추고, 핵심 인프라를 처음부터 다시 설계하기로 결단했습니다. 여기 그 변화의 기록을 공개합니다.

---

## 1. 글로벌 엣지 노드 (CDN 확장)

이전에는 모든 요청이 미국에 있는 중앙 서버로 라우팅되었습니다. 즉, 도쿄에 있는 사용자가 영상을 받으려면 태평양을 건너 요청을 보내고, 처리를 기다렸다가, 다시 태평양을 건너 파일을 받아야 했습니다. 핑(Ping, 지연 시간)만 200ms가 넘었죠.

**업그레이드**:
다음 전략 요충지에 **"엣지 워커 노드(Edge Worker Nodes)"**를 배치했습니다.
*   **도쿄 (JP)**: 한국과 일본의 동아시아 트래픽 처리.
*   **싱가포르 (SG)**: 동남아시아 커버.
*   **프랑크푸르트 (DE)**: 유럽 전역 담당.
*   **상파울루 (BR)**: 남미 트래픽 처리.

**결과**:
*   지연 시간(Latency) **70% 감소**.
*   더 이상 해저 케이블 대역폭의 간섭을 받지 않습니다. 여러분 옆 동네에 있는 서버에서 다운로드하니까요.

---

## 2. "비리비리 엔진" 재작성 (GPU 가속)

비리비리(Bilibili)는 다운로드하기 까다롭기로 악명 높습니다. 대역폭 절약을 위해 오디오(.m4a)와 비디오(.m4v) 트랙을 따로 전송하기 때문입니다. 여러분에게 재생 가능한 MP4를 드리려면, 서버에서 이 둘을 합치는 작업(Remuxing)을 해야 합니다.

**문제점**:
이 합치는 작업은 CPU를 엄청나게 잡아먹습니다. 1,000명의 유저가 동시에 몰리면 CPU 점유율이 100%를 찍고, 대기열이 발생했습니다.

**해결책**:
**GPU 가속 트랜스코딩 파이프라인**을 도입했습니다.
*   단순 연산용 CPU 대신, 영상 처리에 특화된 하드웨어 가속 카드로 작업을 이관했습니다.
*   파일 전체를 다 받을 때까지 기다리지 않고, 스트림을 조각내어 실시간으로 처리하도록 버퍼를 최적화했습니다.
*   **성능 향상**: 비리비리 1080p/60fps 영상 처리 속도가 **4배 빨라졌습니다.**

---

## 3. 틱톡 & 인스타: 자가 치유(Self-Healing) 시스템

SNS 플랫폼들은 스크래퍼(Scraper)를 막기 위해 매일같이 코드를 바꿉니다. HTML 구조를 비틀고, 자바스크립트를 난독화합니다. 예전에는 틱톡이 코드를 바꾸면 엔지니어가 수동으로 고칠 때까지 SSDown이 2~3시간 동안 먹통이 되곤 했습니다.

**진화**:
**AI 기반 파서(Parser)**를 구축했습니다.
*   시스템이 대상 사이트를 24시간 모니터링합니다.
*   다운로드 실패율이 1%를 넘는 등 이상 징후가 감지되면, 머신러닝 모델이 새로운 페이지 패턴을 자동으로 분석합니다.
*   사소한 코드 변경은 사람의 개입 없이 스스로 코드를 수정하여 복구합니다.
*   이것이 바로 **가동률(Uptime) 99.9%**의 비결입니다.

---

## 4. 대역폭(Bandwidth) 업그레이드

티어-1(Tier-1) 네트워크 제공업체와 새로운 계약을 체결했습니다.
*   **기존**: 서버당 1 Gbps 포트.
*   **현재**: 서버당 **10 Gbps 포트**.

여러분이 집에서 기가 인터넷(Fiber)을 쓰고 계신다면, 이제 SSDown이 그 속도를 꽉 채워드릴 수 있습니다. 1GB 파일을 1~2초 만에 받을 수 있습니다.

---

## 다음은 무엇인가요? (로드맵)

저희는 멈추지 않습니다. 2024년 하반기 목표는 다음과 같습니다.
*   **8K 지원**: 유튜브의 8K AV1 코덱 영상을 처리하기 위한 하드웨어 테스트 중입니다.
*   **일괄(Batch) 다운로드**: 프로필 링크 하나만 넣으면 그 계정의 영상 100개를 한 방에 받는 기능 (기획 중).
*   **클라우드 연동**: 내 기기에 저장하지 않고 구글 드라이브나 드롭박스로 바로 쏘는 기능.

---

## 감사의 말씀

인프라를 늘리는 건 돈이 듭니다. 대역폭도 비쌉니다. 그럼에도 SSDown이 무료로 운영될 수 있는 건, 광고 차단을 끄고 이용해 주시거나 친구에게 사이트를 추천해 주시는 충성 유저분들 덕분입니다. 여러분의 지지가 이 업데이트를 가능케 했습니다.

압도적인 속도를 즐기세요.
    `,
  },
  category: "news",
  tags: ["news", "update", "engineering", "speed", "bilibili"],
  author: "SSDown Engineering Team",
  publishedAt: "2025-05-05T09:00:00Z",
  updatedAt: "2025-12-17T14:20:00Z",
  image: "/logo.png",
  readTime: 5,
  status: "published",
  createdAt: "2025-05-05T09:00:00Z",
};
