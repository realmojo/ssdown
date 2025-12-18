import { Post } from "./types";

export const post: Post = {
  id: "video-formats-mp4-webm",
  title: {
    en: "MP4 vs WebM: The Ultimate Battle of Video Formats (And Which One You Should Download)",
    kr: "MP4 대 WebM: 무엇을 다운로드해야 할까? 호환성부터 화질까지 비디오 포맷 완벽 해부",
  },
  excerpt: {
    en: "Confused by file extensions? Dive into the technical war between H.264 (MP4) and VP9 (WebM). Learn why iPhone users struggle with WebM and why MP4 remains the king of compatibility.",
    kr: "파일 확장자가 헷갈리시나요? H.264(MP4)와 VP9(WebM)의 기술 전쟁을 분석합니다. 왜 아이폰에서는 WebM이 안 열리는지, 왜 MP4가 여전히 호환성의 제왕인지 알려드립니다.",
  },
  content: {
    en: `
## The "Invalid File Format" Nightmare

You just downloaded a 4K video. You send it to your friend on WhatsApp. They reply: *"It won't play."* or *"I only hear sound but see a black screen."*

The culprit is usually the **Video Format**.
In the digital video world, there are two giants fighting for dominance: **MP4** and **WebM**. SSDown supports both, but knowing which one to pick will save you massive headaches.

---

## 1. MP4 (MPEG-4 Part 14) - The King of Compatibility

If video formats were cars, MP4 would be a Toyota Corolla. It is everywhere.

### The Technology (H.264 / AVC)
Inside the MP4 container usually lives the **H.264** video codec. This standard was established in the early 2000s and is supported by hardware in almost every device made in the last 15 years.
*   **Pros**:
    *   **Universal**: Playable on iPhone, Android, Windows, Mac, Linux, Smart TVs, and even old DVD players with USB ports.
    *   **Edit-Friendly**: Premiere Pro, Final Cut, and CapCut love MP4.
    *   **Social Ready**: Instagram, TikTok, and Twitter accept MP4 uploads natively.
*   **Cons**:
    *   **Legally Encumbered**: It's patented technology (though free for end-users).
    *   **Size**: Slightly larger file sizes compared to newer formats.

**Who should choose MP4?**
*   **iPhone Users**: iOS has strict codec support. MP4 is the native language of the iPhone.
*   **Video Editors**: If you plan to remix the video.
*   **Average Users**: If you just want it to work without thinking.

---

## 2. WebM - The Google Challenger

If MP4 is Toyota, WebM is a Tesla. Newer, more efficient, but you can't find a charging station everywhere.

### The Technology (VP9 / AV1)
Developed by Google, WebM is designed specifically for the **Web**. It usually uses the **VP9** or the cutting-edge **AV1** codec. YouTube uses WebM for almost all its 4K and 8K videos because it compresses data much better.
*   **Pros**:
    *   **Efficiency**: A WebM file can be 30-50% smaller than an MP4 file with the *same* visual quality. This saves data.
    *   **Open Source**: Royalty-free technology.
    *   **Transparency**: WebM supports transparent backgrounds (alpha channels), useful for web design.
*   **Cons**:
    *   **The Apple Problem**: Older iPhones and macOS versions (before extremely recent updates) simply **cannot play WebM** natively in the Photos app. You see a blank screen. You need a third-party player like VLC.
    *   **Editor Issues**: Adobe Premiere sometimes struggles with WebM files, requiring you to convert them first.

**Who should choose WebM?**
*   **Android Users**: Android loves WebM.
*   **Data Savers**: If you have limited storage space.
*   **Archivists**: If you want the absolute highest quality stream from YouTube (which serves 4K/8K mostly in WebM).

---

## The Container vs. Codec Myth

Many people think ".mp4" determines the quality. **Wrong.**
The file extension (.mp4, .webm) is just a **Container** (like a box).
The **Codec** (H.264, VP9) is what's inside the box (the actual video data).

*   You can have a terrible, pixelated video inside an MP4 box.
*   You can have a crystal clear 4K video inside a WebM box.

**SSDown's Default**:
By default, SSDown tries to give you **MP4 (H.264)** because our priority is that *it plays on your device*. However, for very high resolutions (2K/4K) on sites like YouTube, the only source might be WebM. In that case, we provide the WebM file to ensure you get the pixels you asked for.

---

## Troubleshooting Playback Issues

**Scenario 1: "I downloaded a WebM on my iPhone and it won't play."**
*   **Fix A**: Download **VLC for Mobile** from the App Store. It plays everything.
*   **Fix B**: Use a "WebM to MP4" converter (SSDown is working on adding this feature server-side!).

**Scenario 2: "The file size is huge."**
*   **Fix**: You probably downloaded a high-bitrate MP4. Try downloading the WebM version if available; it will be lighter.

**Scenario 3: "No sound?"**
*   **Reason**: Sometimes "Pure Format" streams (especially MKV or WebM) separate audio and video.
*   **Fix**: Use SSDown! We purposefully remux (combine) audio and video so you don't have to deal with silent files.

---

## Conclusion: Which Button Do I Click?

*   **Click MP4 if**: You have an iPhone, you want to share it on Instagram, or you want to send it to your grandma.
*   **Click WebM if**: You are on Android/PC, you care about file size, or you want 4K/8K quality from YouTube.

Understanding formats gives you power. Choose wisely, and never see an error message again.
    `,
    kr: `
## "지원하지 않는 파일 형식입니다." 악몽

4K 영상을 힘들게 다운로드했습니다. 신나서 카카오톡으로 친구한테 보냈죠. 그런데 답장이 옵니다. *"재생이 안 돼"* 혹은 *"소리만 나오고 화면이 검은색이야."*

범인은 바로 **비디오 포맷**입니다.
디지털 비디오 세계에는 패권을 다투는 두 거인이 있습니다: **MP4**와 **WebM**입니다. SSDown은 둘 다 지원하지만, 어떤 걸 선택하느냐에 따라 여러분의 정신 건강이 달라집니다.

---

## 1. MP4 (MPEG-4 Part 14) - 호환성의 제왕

비디오 포맷을 자동차에 비유하자면, MP4는 '아반떼'나 '소나타'입니다. 어디에나 있고, 어느 정비소(기기)에 가도 다 고쳐줍니다.

### 기술적 배경 (H.264 / AVC)
MP4라는 컨테이너(상자) 안에는 보통 **H.264**라는 코덱이 들어있습니다. 2000년대 초반에 정립된 표준으로, 지난 15년간 출시된 거의 모든 기기의 칩셋이 이 코덱을 하드웨어적으로 지원합니다.
*   **장점**:
    *   **유니버설**: 아이폰, 갤럭시, 윈도우, 맥, 리눅스, 스마트 TV, 심지어 USB 달린 옛날 DVD 플레이어에서도 돌아갑니다.
    *   **편집 친화적**: 프리미어 프로, 파이널 컷, 캡컷 등 모든 편집 툴이 MP4를 가장 좋아합니다.
    *   **업로드 용이**: 인스타, 틱톡, 트위터에 올릴 때 변환 없이 바로 올라갑니다.
*   **단점**:
    *   **용량**: 최신 포맷에 비해 압축 효율이 떨어져서 파일 크기가 조금 더 큽니다.

**누가 MP4를 선택해야 하나요?**
*   **아이폰 유저**: 필수입니다. iOS는 코덱을 매우 가립니다.
*   **영상 편집자**: 2차 가공을 할 계획이라면 MP4가 정신건강에 좋습니다.
*   **일반 유저**: 그냥 머리 쓰기 싫고 "무조건 재생됐으면" 하는 분들.

---

## 2. WebM - 구글이 만든 도전자

MP4가 아반떼라면, WebM은 '테슬라'입니다. 최신 기술이고 효율적이지만, 아직 모든 곳에 충전소가 있는 건 아닙니다.

### 기술적 배경 (VP9 / AV1)
구글이 **'웹(Web)'**을 위해 특별히 개발했습니다. 보통 **VP9**이나 최신 **AV1** 코덱을 사용합니다. 유튜브는 4K, 8K, 60fps 영상을 대부분 WebM으로 송출합니다. 압축률이 훨씬 좋거든요.
*   **장점**:
    *   **효율성**: 똑같은 눈으로 보는 화질일 때, MP4보다 용량이 **30~50% 더 작습니다.** 데이터를 엄청 아낄 수 있죠.
    *   **오픈 소스**: 저작권료가 없는 무료 기술입니다.
    *   **투명 배경**: 투명한 배경(알파 채널)을 지원해서 웹 디자인에 유용합니다.
*   **단점**:
    *   **애플의 배척**: 구형 아이폰이나 맥(OS 버전에 따라 다름)의 사진 앱은 WebM을 **재생하지 못합니다.** 그냥 검은 화면만 나옵니다. VLC 같은 별도 앱이 필요합니다.
    *   **편집 오류**: 프리미어 프로에서 호환성 문제로 버벅거리거나 소리가 밀릴 수 있습니다.

**누가 WebM을 선택해야 하나요?**
*   **안드로이드 유저**: 갤럭시는 WebM을 아주 잘 소화합니다.
*   **데이터 절약파**: 폰 용량이 부족할 때.
*   **고화질 수집가**: 유튜브 4K/8K 원본 화질을 원한다면 선택권 없이 WebM을 받아야 할 때가 많습니다.

---

## 컨테이너 vs 코덱 (오해 풀기)

많은 분들이 ".mp4"라고 적혀 있으면 화질이 다 똑같은 줄 아십니다. **틀렸습니다.**
확장자(.mp4, .webm)는 그냥 **택배 상자(Container)**일 뿐입니다.
화질을 결정하는 건 상자 안에 든 **내용물(Codec)**입니다.

*   MP4 상자에 든 깍두기 화질 영상이 있을 수 있고,
*   WebM 상자에 든 초고화질 4K 영상이 있을 수 있습니다.

**SSDown의 정책**:
저희는 기본적으로 **MP4 (H.264)** 변환을 우선시합니다. 여러분의 기기에서 재생되는 것이 최우선이기 때문입니다. 하지만 2K/4K 이상의 초고화질인 경우, 원본 소스가 WebM밖에 없다면 WebM을 그대로 제공하여 화질 저하를 방지합니다.

---

## 재생 문제 해결 (Troubleshooting)

**상황 1: "아이폰에서 WebM을 받았는데 재생이 안 돼요."**
*   **해결 A**: 앱스토어에서 **VLC 플레이어**를 받으세요. 만능 재생기입니다.
*   **해결 B**: SSDown이 곧 서버 사이드 변환 기능을 강화할 예정입니다. 기다려주세요!

**상황 2: "파일 용량이 너무 커요."**
*   **해결**: 혹시 고화질 MP4를 받으셨나요? WebM 옵션이 있다면 그걸 받아보세요. 훨씬 가볍습니다.

**상황 3: "소리가 안 나요?"**
*   **이유**: MKV나 WebM 같은 '순수 포맷' 스트림은 원래 오디오와 비디오가 분리되어 있습니다.
*   **해결**: SSDown을 쓰세요! 저희는 다운로드 과정에서 이 둘을 합체(Remux)시켜서, 소리 빵빵한 완성본을 드립니다.

---

## 결론: 그래서 무슨 버튼을 눌러요?

*   **이걸 누르세요 MP4**: 아이폰을 쓴다 / 인스타에 올릴 거다 / 컴맹 친구한테 보낼 거다.
*   **이걸 누르세요 WebM**: 갤럭시를 쓴다 / 용량이 부족하다 / 유튜브 4K 화질이 필요하다.

아는 것이 힘입니다. 이제 오류 메시지 앞에서 당황하지 마세요.
    `,
  },
  category: "tech",
  tags: ["tech", "formats", "mp4", "webm", "comparison", "guide"],
  author: "SSDown Tech Team",
  publishedAt: "2025-04-05T13:20:00Z",
  updatedAt: "2025-12-17T14:35:00Z",
  image: "/logo.png",
  readTime: 6,
  status: "published",
  createdAt: "2025-04-05T13:20:00Z",
};
