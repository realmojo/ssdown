import { Post } from "./posts";

export const STATIC_POSTS: Post[] = [
  {
    id: "how-to-download-twitter-videos",
    title: {
      en: "How to Download Twitter (X) Videos in 4K Quality",
      kr: "트위터(X) 동영상 4K 고화질 다운로드 방법 완벽 가이드",
    },
    excerpt: {
      en: "A step-by-step guide to saving high-quality videos and GIFs from X (formerly Twitter) to your device instantly.",
      kr: "X(구 트위터)에서 고화질 동영상과 GIF를 쉽고 빠르게 다운로드하는 방법을 단계별로 알아봅니다.",
    },
    content: {
      en: `
## Why Download Twitter Videos?

Twitter, now known as X, is a goldmine of real-time news, funny clips, and amazing fan art. However, the platform doesn't provide a native button to save these videos to your camera roll or computer. That's where **SSDown** comes in.

## Step-by-Step Guide

### 1. Find the Tweet
Open the X app or website and locate the video you want to save. Make sure the account is public.

### 2. Copy the Link
Click the "Share" icon (arrow) at the bottom right of the tweet. Select "Copy Link".

### 3. Paste into SSDown
Go to [SSDown.app](https://ssdown.app/x) and paste the link into the input box.

### 4. Download
Click the "Download" button. You will see options for different resolutions (720p, 1080p, etc.). Choose the highest quality for the best experience.

## Tips for Best Quality
Always look for the original uploader's tweet. Reposted videos often have lower quality due to compression. SSDown always attempts to fetch the highest bitrate stream available from X's servers.
      `,
      kr: `
## 트위터 영상을 다운로드해야 하는 이유

X(트위터)는 실시간 뉴스, 재미있는 클립, 멋진 팬 아트가 넘쳐나는 곳입니다. 하지만 앱 자체에서는 영상을 갤러리에 저장하는 기능을 제공하지 않습니다. 바로 이럴 때 **SSDown**이 필요합니다.

## 단계별 가이드

### 1. 트윗 찾기
X 앱이나 웹사이트를 열고 저장하고 싶은 영상을 찾으세요. 공개 계정의 영상만 다운로드가 가능합니다.

### 2. 링크 복사하기
트윗 우측 하단의 "공유하기" 아이콘(화살표)을 누르고 "링크 복사하기"를 선택하세요.

### 3. SSDown에 붙여넣기
[SSDown.app/x](https://ssdown.app/x)로 이동하여 입력창에 링크를 붙여넣으세요.

### 4. 다운로드
"Download" 버튼을 클릭하면 720p, 1080p 등 다양한 해상도 옵션이 나타납니다. 최고의 경험을 위해 가장 높은 화질을 선택하세요.

## 고화질 팁
가능하면 원본 업로더의 트윗을 찾으세요. 재업로드된 영상은 압축으로 인해 화질이 낮을 수 있습니다. SSDown은 항상 X 서버에서 제공하는 최고 비트레이트의 영상을 가져옵니다.
      `,
    },
    category: "x",
    tags: ["twitter", "x", "guide", "tutorial"],
    author: "SSDown Team",
    publishedAt: "2024-03-15T09:00:00Z",
    updatedAt: "2024-03-15T09:00:00Z",
    image: "/ssdown-x-og.png",
    readTime: 3,
    status: "published",
    createdAt: "2024-03-15T09:00:00Z",
  },
  {
    id: "tiktok-no-watermark-guide",
    title: {
      en: "The Ultimate Guide to Saving TikToks Without Watermark",
      kr: "틱톡 워터마크 없이 영상 저장하는 완벽 가이드",
    },
    excerpt: {
      en: "Learn how to remove the annoying TikTok logo from your downloaded videos for cleaner sharing and reposting.",
      kr: "다운로드한 영상에서 거슬리는 틱톡 로고를 제거하고 깔끔하게 공유하는 방법을 알아보세요.",
    },
    content: {
      en: `
## Why Remove the Watermark?
When you download a video directly from TikTok, it stamps a floating watermark with the username. This can be distracting and looks unprofessional if you're compiling clips or sharing to other platforms like Instagram Reels.

## How SSDown Works
SSDown intercepts the video stream URL directly from TikTok's API before the watermark overlay is applied. This gives you the clean, raw video file.

1. **Copy Link**: From the TikTok app, hit Share > Copy Link.
2. **Visit SSDown**: Navigate to our TikTok downloader.
3. **Download**: Hit the button and enjoy your clean video.

## Is it Legal?
Downloading for personal offline viewing is generally fine. However, **never claim ownership** of someone else's content. Always credit the original creator if you repost.
      `,
      kr: `
## 왜 워터마크를 제거해야 할까요?
틱톡 앱에서 직접 다운로드하면 유저 이름이 적힌 워터마크가 영상에 떠다닙니다. 이는 영상 감상에 방해가 되고, 인스타그램 릴스 등으로 공유할 때 깔끔하지 않아 보입니다.

## SSDown의 작동 원리
SSDown은 워터마크가 입혀지기 전의 원본 비디오 스트림 URL을 틱톡 API로부터 직접 추출합니다. 이를 통해 깨끗한 원본 파일을 얻을 수 있습니다.

1. **링크 복사**: 틱톡 앱에서 공유 > 링크 복사를 선택합니다.
2. **SSDown 접속**: SSDown의 틱톡 다운로더로 이동합니다.
3. **다운로드**: 버튼을 누르고 깨끗한 영상을 즐기세요.

## 저작권 주의사항
개인 소장용으로 다운로드하는 것은 괜찮습니다. 하지만 **타인의 콘텐츠를 자신의 것처럼 사칭하지 마세요.** 재업로드 시에는 반드시 원작자를 명시해야 합니다.
      `,
    },
    category: "tiktok",
    tags: ["tiktok", "watermark", "clean", "guide"],
    author: "SSDown Team",
    publishedAt: "2024-03-18T10:00:00Z",
    updatedAt: "2024-03-18T10:00:00Z",
    image: "/ssdown-tiktok-og.png",
    readTime: 4,
    status: "published",
    createdAt: "2024-03-18T10:00:00Z",
  },
  {
    id: "instagram-reels-download-tips",
    title: {
      en: "Instagram Reels Downloader: Save Vertical Videos Easily",
      kr: "인스타그램 릴스 다운로더: 세로 영상을 손쉽게 저장하기",
    },
    excerpt: {
      en: "Don't lose your favorite Reels. Here is how to archive them permanently on your phone or PC.",
      kr: "좋아하는 릴스 영상을 잃어버리지 마세요. 휴대폰이나 PC에 영구 소장하는 방법을 알려드립니다.",
    },
    content: {
      en: `
## The Rise of Reels
Instagram Reels have become the dominant content format. But Instagram makes it hard to save them, especially with audio. Screen recording often results in poor quality and UI clutter.

## Utilizing SSDown for Reels
SSDown extracts the MP4 file directly from Instagram's CDN.

- **High Quality**: We fetch the 1080p version if available.
- **Audio Included**: Unlike some tools, we ensure the sound works.
- **Anonymous**: The creator won't know you downloaded it.

## Quick Steps
1. Open the Reel.
2. Tap three dots (...) > Copy Link.
3. Paste on SSDown and save.
      `,
      kr: `
## 릴스 전성시대
인스타그램 릴스는 이제 가장 인기 있는 콘텐츠 형식이 되었습니다. 하지만 인스타그램은 오디오가 포함된 영상을 저장하기 어렵게 만들어 놓았습니다. 화면 녹화는 화질이 떨어지고 UI까지 같이 녹화되는 단점이 있죠.

## SSDown을 활용한 릴스 저장
SSDown은 인스타그램 CDN에서 MP4 파일을 직접 추출합니다.

- **고화질**: 1080p 원본 화질을 그대로 가져옵니다.
- **오디오 포함**: 소리까지 완벽하게 저장됩니다.
- **익명성**: 다운로드 사실이 상대방에게 알림으로 가지 않습니다.

## 빠른 사용법
1. 릴스를 엽니다.
2. 점 세 개(...) 버튼 > 링크 복사를 누릅니다.
3. SSDown에 붙여넣고 저장하세요.
      `,
    },
    category: "instagram",
    tags: ["instagram", "reels", "guide"],
    author: "SSDown Team",
    publishedAt: "2024-03-20T14:30:00Z",
    updatedAt: "2024-03-20T14:30:00Z",
    image: "/ssdown-instagram-og.png",
    readTime: 3,
    status: "published",
    createdAt: "2024-03-20T14:30:00Z",
  },
  {
    id: "content-creator-tools-2024",
    title: {
      en: "Top 5 Tools for Content Creators in 2024",
      kr: "2024년 콘텐츠 크리에이터를 위한 필수 도구 Top 5",
    },
    excerpt: {
      en: "From video editors to analytics, these tools will skyrocket your productivity.",
      kr: "영상 편집부터 분석까지, 당신의 생산성을 폭발적으로 높여줄 도구들을 소개합니다.",
    },
    content: {
      en: `
## 1. CapCut
The best mobile editor for short-form content. Pairs perfectly with SSDown if you need to download assets for editing.

## 2. SSDown
Essential for benchmarking. Download viral videos from competitors to analyze what makes them successful, or to create reaction videos without watermarks.

## 3. Canva
For thumbnails and channel art.

## 4. Notion
For content planning and scripting.

## 5. ChatGPT
For generated viral hooks and descriptions.

Using these tools in harmony creates a powerful workflow for modern creators.
      `,
      kr: `
## 1. 캡컷 (CapCut)
숏폼 콘텐츠를 위한 최고의 모바일 편집기입니다. SSDown과 함께 사용하면 편집 소스를 구하기 매우 편리합니다.

## 2. SSDown
벤치마킹 필수품입니다. 경쟁자의 바이럴 영상을 다운로드하여 성공 요인을 분석하거나, 워터마크 없는 리액션 영상을 만들 때 유용합니다.

## 3. 캔바 (Canva)
썸네일과 채널 아트를 위한 최고의 디자인 도구입니다.

## 4. 노션 (Notion)
콘텐츠 기획과 대본 작성에 최적화된 노트 앱입니다.

## 5. ChatGPT
바이럴 훅 문구와 설명글을 작성할 때 큰 도움이 됩니다.

이 도구들을 조화롭게 사용하면 현대 크리에이터에게 강력한 워크플로우를 제공합니다.
      `,
    },
    category: "general",
    tags: ["tools", "creators", "productivity"],
    author: "SSDown Team",
    publishedAt: "2024-03-22T08:15:00Z",
    updatedAt: "2024-03-22T08:15:00Z",
    image: "/logo.png",
    readTime: 5,
    status: "published",
    createdAt: "2024-03-22T08:15:00Z",
  },
  {
    id: "dailymotion-offline-viewing",
    title: {
      en: "How to Save Dailymotion Videos Offline",
      kr: "데일리모션 영상을 오프라인으로 저장하는 방법",
    },
    excerpt: {
      en: "Dailymotion hosts unique content not found elsewhere. Learn how to keep it forever.",
      kr: "데일리모션에는 다른 곳에 없는 독특한 영상들이 많습니다. 이를 영구 소장하는 방법을 알아보세요.",
    },
    content: {
      en: `
## Unique Library of Dailymotion
While YouTube dominates, Dailymotion often has older TV shows, rare music videos, and regional content. 

## The Challenge
Dailymotion videos are streamed in fragmented chunks (HLS/m3u8), making them hard to save with simple "right-click save" methods.

## The Solution
SSDown's specialized engine stitches these fragments back together in the cloud (or via our smart browser downloader) to deliver a single, smooth MP4 file.

Just paste the URL and let our servers handle the complex re-assembly process.
      `,
      kr: `
## 데일리모션만의 독특한 라이브러리
유튜브가 지배적이지만, 데일리모션에는 옛날 TV 쇼, 희귀한 뮤직비디오, 지역별 특화 콘텐츠가 많이 남아있습니다.

## 어려움
데일리모션 영상은 수많은 조각(HLS/m3u8)으로 나뉘어 전송되기 때문에, 단순한 "우클릭 저장"으로는 받을 수 없습니다.

## 해결책
SSDown의 특수 엔진은 이 조각들을 서버(또는 브라우저)에서 다시 하나로 합쳐서, 매끄러운 원본 MP4 파일로 만들어 제공합니다.

URL만 붙여넣으세요. 복잡한 재조립 과정은 저희 서버가 처리합니다.
      `,
    },
    category: "dailymotion",
    tags: ["dailymotion", "offline", "guide"],
    author: "SSDown Team",
    publishedAt: "2024-03-25T11:00:00Z",
    updatedAt: "2024-03-25T11:00:00Z",
    image: "/ssdown-dailymotion-og.png",
    readTime: 4,
    status: "published",
    createdAt: "2024-03-25T11:00:00Z",
  },
  {
    id: "bilibili-anime-download-guide",
    title: {
      en: "Downloading Bilibili Anime & Videos: A Step-by-Step Guide",
      kr: "비리비리 애니메이션 & 영상 다운로드 완벽 가이드",
    },
    excerpt: {
      en: "Access the vast world of Chinese ACG content on Bilibili and save it locally.",
      kr: "방대한 중국 ACG 콘텐츠의 보고인 비리비리, 영상을 내 컴퓨터에 저장하는 방법을 소개합니다.",
    },
    content: {
      en: `
## What is Bilibili?
Bilibili is China's answer to YouTube, but with a heavy focus on Anime, Comics, and Games (ACG). It's famous for its "Danmu" (bullet curtain) comments.

## Downloading from Bilibili
Downloading from Bilibili can be tricky due to regional restrictions and split video/audio tracks.

### Using SSDown for Bilibili
1. **Get the Link**: Support both 'BV' codes and full URLs.
2. **Merge Audio/Video**: Bilibili separates video and audio streams to save bandwidth. SSDown automatically merges them into a standard MP4 file for you.
3. **High Definition**: We support up to 1080p downloads for free users.

Enjoy your favorite AMVs and anime clips offline!
      `,
      kr: `
## 비리비리란?
비리비리는 중국판 유튜브로 불리지만, 애니메이션, 만화, 게임(ACG)에 특화되어 있습니다. 화면 위로 흐르는 "단무(탄막)" 댓글 기능으로 유명합니다.

## 비리비리 영상 다운로드하기
비리비리는 지역 제한과 오디오/비디오 트랙 분리 기술 때문에 일반적인 방법으로는 다운로드가 까다롭습니다.

### SSDown으로 해결하기
1. **링크 확보**: 'BV' 코드는 물론 전체 URL도 지원합니다.
2. **오디오/비디오 병합**: 비리비리는 대역폭 절약을 위해 영상과 소리를 따로 보냅니다. SSDown은 이를 자동으로 합쳐서 온전한 MP4 파일로 만들어 드립니다.
3. **고화질 지원**: 1080p 고화질까지 무료로 지원합니다.

좋아하는 AMV와 애니메이션 클립을 오프라인에서 즐기세요!
      `,
    },
    category: "bilibili",
    tags: ["bilibili", "anime", "guide"],
    author: "SSDown Team",
    publishedAt: "2024-03-28T16:45:00Z",
    updatedAt: "2024-03-28T16:45:00Z",
    image: "/ssdown-bilibili-og.png",
    readTime: 5,
    status: "published",
    createdAt: "2024-03-28T16:45:00Z",
  },
  {
    id: "copyright-fair-use-guide",
    title: {
      en: "Copyright & Fair Use: What You Need to Know",
      kr: "저작권과 공정 이용: 다운로드 전 꼭 알아야 할 상식",
    },
    excerpt: {
      en: "Stay safe and legal. Understanding the boundaries of personal use vs copyright infringement.",
      kr: "안전하고 합법적인 이용을 위해. 개인 소장과 저작권 침해의 경계를 알아봅니다.",
    },
    content: {
      en: `
## Personal Use is Key
In many jurisdictions, downloading copyrighted material for **personal, offline viewing** (time-shifting) falls under a grey area or fair use, provided you do not redistribute it.

## Do NOT:
- **Re-upload** downloaded videos to your own YouTube/TikTok channel as your own.
- **Sell** the downloaded content.
- Use it for **commercial advertisements** without license.

## DO:
- Keep it for personal archive.
- Use clips for "commentary" or "critique" (Fair Use transformation).
- Always credit the original source.

*Disclaimer: This is not legal advice. Laws vary by country.*
      `,
      kr: `
## 핵심은 '개인적 용도'
대부분의 국가에서 **개인적인 오프라인 시청**을 위해 영상을 다운로드하는 것은 공가 이용(Fair Use)이나 사적 복제의 영역으로 간주될 수 있습니다. 단, 이를 재배포하지 않는다는 전제 하에서입니다.

## 절대 하지 말아야 할 것:
- 다운로드한 영상을 내 유튜브/틱톡 채널에 **재업로드**하여 수익 창출하기.
- 영상을 **판매**하기.
- 허가 없이 **상업적 예고편** 등에 사용하기.

## 권장 사항:
- 개인 소장용 아카이브로만 활용하세요.
- 비평이나 해설을 위한 "인용" 목적으로만 짧게 사용하세요 (공정 이용).
- 반드시 원작자를 명시하세요.

*면책 조항: 이 글은 법률 자문이 아니며, 국가마다 법이 다를 수 있습니다.*
      `,
    },
    category: "general",
    tags: ["legal", "copyright", "safety"],
    author: "SSDown Legal Team",
    publishedAt: "2024-04-01T09:00:00Z",
    updatedAt: "2024-04-01T09:00:00Z",
    image: "/logo.png",
    readTime: 3,
    status: "published",
    createdAt: "2024-04-01T09:00:00Z",
  },
  {
    id: "video-formats-mp4-webm",
    title: {
      en: "Understanding Video Formats: MP4 vs WebM",
      kr: "비디오 포맷 완전 정복: MP4 대 WebM",
    },
    excerpt: {
      en: "Which format should you choose for your downloads? We explain the difference.",
      kr: "다운로드할 때 어떤 포맷을 선택해야 할까요? 두 포맷의 차이점을 알기 쉽게 설명합니다.",
    },
    content: {
      en: `
## MP4 (H.264)
- **Compatibility**: Plays on EVERYTHING. iPhone, Android, Windows, Mac, Smart TVs.
- **Size**: Moderate. Good compression.
- **Best for**: Sharing, storing on phone.

## WebM (VP9)
- **Compatibility**: Built for the web. Works great in browsers (Chrome/Firefox) but might not play on older iPhones without VLC.
- **Size**: Often smaller than MP4 for the same quality.
- **Best for**: Web developers, newer Android devices.

## Verdict
For 99% of users, **choose MP4**. It's simply the safest bet for compatibility. SSDown defaults to MP4 conversion for this reason.
      `,
      kr: `
## MP4 (H.264)
- **호환성**: 거의 모든 기기에서 재생됩니다. 아이폰, 안드로이드, 윈도우, 맥, 스마트 TV 등.
- **용량**: 적당함. 압축 효율이 좋습니다.
- **추천**: 친구에게 공유하거나 폰에 저장할 때.

## WebM (VP9)
- **호환성**: 웹을 위해 만들어졌습니다. 크롬 등 브라우저에서는 잘 되지만, 아이폰 기본 앱에서는 재생이 안 될 수 있습니다.
- **용량**: 같은 화질일 때 MP4보다 더 작을 때가 많습니다.
- **추천**: 웹 개발자, 최신 안드로이드 유저.

## 결론
99%의 사용자에게는 **MP4를 추천합니다**. 호환성 걱정이 없기 때문입니다. SSDown이 기본적으로 MP4 변환을 제공하는 이유이기도 합니다.
      `,
    },
    category: "tech",
    tags: ["tech", "formats", "mp4"],
    author: "SSDown Tech",
    publishedAt: "2024-04-05T13:20:00Z",
    updatedAt: "2024-04-05T13:20:00Z",
    image: "/logo.png",
    readTime: 4,
    status: "published",
    createdAt: "2024-04-05T13:20:00Z",
  },
  {
    id: "safe-browsing-tips",
    title: {
      en: "Safe Visiting: How to Check Video URLs",
      kr: "안전한 웹 서핑: 가짜 비디오 링크 구별법",
    },
    excerpt: {
      en: "Avoid phishing and malware. How to spot a legitimate video link versus a dangerous one.",
      kr: "피싱과 악성코드를 피하세요. 진짜 비디오 링크와 위험한 링크를 구별하는 방법을 알려드립니다.",
    },
    content: {
      en: `
## The Danger of Shortlinks
Scammers often use shortened links to hide malicious URLs. 

## Verify the Source
- **TikTok**: Should start with \`tiktok.com\` or \`vm.tiktok.com\`.
- **Twitter**: \`twitter.com\` or \`x.com\`.
- **Instagram**: \`instagram.com\`.

If you see a link like \`free-video-winner.com\`, **DO NOT CLICK**.

## Using SSDown as a Filter
SSDown validates URLs before processing. If you paste a malicious link, our server will likely reject it as "Invalid URL", saving you from potentially visiting a harmful site directly.
      `,
      kr: `
## 단축 링크의 위험성
사기꾼들은 악성 URL을 숨기기 위해 단축 링크를 자주 사용합니다.

## 출처 확인하기
- **틱톡**: \`tiktok.com\` 또는 \`vm.tiktok.com\`으로 시작해야 합니다.
- **트위터**: \`twitter.com\` 또는 \`x.com\`.
- **인스타그램**: \`instagram.com\`.

만약 \`free-video-winner.com\` 같은 이상한 주소라면 **절대 클릭하지 마세요.**

## 필터로서의 SSDown
SSDown은 처리 전에 URL 유효성을 검사합니다. 만약 악성 링크를 붙여넣으셨다면, 저희 서버가 "유효하지 않은 URL"로 거절함으로써 여러분이 유해 사이트에 직접 접속하는 것을 막아줄 수 있습니다.
      `,
    },
    category: "security",
    tags: ["security", "tips", "safety"],
    author: "SSDown Security",
    publishedAt: "2024-04-08T10:00:00Z",
    updatedAt: "2024-04-08T10:00:00Z",
    image: "/logo.png",
    readTime: 3,
    status: "published",
    createdAt: "2024-04-08T10:00:00Z",
  },
  {
    id: "facebook-video-downloader-guide",
    title: {
      en: "How to Download Public Facebook Videos",
      kr: "페이스북 전체공개 동영상 다운로드 가이드",
    },
    excerpt: {
      en: "Save funny clips and memories from Facebook to your gallery.",
      kr: "페이스북의 재미있는 클립과 추억을 내 갤러리에 저장하세요.",
    },
    content: {
      en: `
## Facebook is Still King
Despite the rise of TikTok, Facebook remains the place for long-form content, gaming streams, and family memories.

## How to Save FB Videos
Facebook's app saves videos within the app ("Saved" collection), but not to your phone.

### using SSDown:
1. Tap "Share" on the post.
2. Tap "Copy Link" (or "More Options" > "Copy").
3. Paste into SSDown's Facebook tool.
4. Select **HD Quality**.

Now the video is yours to keep in your actual phone gallery.
      `,
      kr: `
## 여전히 강력한 페이스북
틱톡이 떴다지만, 페이스북은 여전히 긴 영상, 게임 스트리밍, 가족들의 추억이 모이는 곳입니다.

## 페북 영상 저장법
페이스북 앱의 "저장됨" 기능은 앱 내에서만 볼 수 있습니다. 내 폰으로 꺼내오려면 어떻게 해야 할까요?

### SSDown 사용하기:
1. 게시물에서 "공유" 버튼을 누릅니다.
2. "링크 복사"를 누릅니다.
3. SSDown의 페이스북 도구에 붙여넣습니다.
4. **HD 화질**을 선택합니다.

이제 영상은 앱이 아닌 여러분의 휴대폰 갤러리에 영구 저장됩니다.
      `,
    },
    category: "facebook",
    tags: ["facebook", "guide", "tutorial"],
    author: "SSDown Team",
    publishedAt: "2024-04-10T15:00:00Z",
    updatedAt: "2024-04-10T15:00:00Z",
    image: "/ssdown-facebook-og.png",
    readTime: 3,
    status: "published",
    createdAt: "2024-04-10T15:00:00Z",
  },
];
