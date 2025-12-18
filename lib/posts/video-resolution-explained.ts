import { Post } from "./types";

export const post: Post = {
  id: "video-resolution-explained",
  title: {
    en: "The Resolution Guide: Why 4K Isn't Always Better Than 1080p (Bitrate & PPI Explained)",
    kr: "화질의 진실: 무조건 4K가 정답이 아닌 이유 (비트레이트와 해상도의 비밀)",
  },
  excerpt: {
    en: "Confused by 720p, 1080p, and 4K? Learn the science of pixels, bitrate, and screen density to choose the perfect quality for your device and save storage space.",
    kr: "720p, 1080p, 4K... 숫자가 높으면 무조건 좋을까요? 픽셀의 과학과 비트레이트의 개념을 이해하고, 내 폰과 용량에 딱 맞는 최적의 화질을 선택하는 법을 알려드립니다.",
  },
  content: {
    en: `
## "The Bigger, The Better" Myth

We are programmed to think bigger numbers mean better quality. TV manufacturers discourage us with **4K** and **8K** marketing. But when it comes to downloading videos for personal use, choosing the highest number is often a waste of time and storage.

To make smart choices, you need to understand three concepts: **Resolution**, **Bitrate**, and **Viewing Distance**.

---

## 1. Resolution: The Canvas Size

Resolution is simply the number of pixels (dots) that make up the image.
*   **720p (HD)**: 1280 x 720 pixels (0.9 Million pixels).
*   **1080p (Full HD)**: 1920 x 1080 pixels (2 Million pixels).
*   **1440p (2K/QHD)**: 2560 x 1440 pixels (3.7 Million pixels).
*   **2160p (4K/UHD)**: 3840 x 2160 pixels (8.3 Million pixels).

**The Reality Check**:
Most smartphones (even the expensive ones like iPhone 15) have screens that are physically small. Their "Pixel Density" (PPI) is high, but the human eye has limits.
On a 6-inch phone screen held at arm's length, the human eye **cannot distinguish** between 1080p and 4K.
If you download a 4K video to watch on the bus, you are downloading 4x the data for **zero visual improvement**.

---

## 2. Bitrate: The Actual Paint

Here is the secret: **Bitrate matters more than Resolution.**
Bitrate is the amount of data used per second (Mbps).

*   **Scenario A**: A 4K video with low bitrate (YouTube compression).
*   **Scenario B**: A 1080p video with high bitrate (Blu-ray quality).

**Result**: Scenario B will look significantly better. Scenario A will look "blocky" or pixelated, especially during fast-moving scenes (like confetti or water splashing), even though it has more pixels.
*   **SSDown's Logic**: We always fetch the **highest bitrate stream** available. A high-bitrate 1080p file is often visually superior to a starved 4K stream.

---

## 3. Frame Rate (FPS): Smoothness

Usually, you see **30fps** or **60fps**.
*   **30fps**: Standard for TV shows, movies, and most TikToks.
*   **60fps**: Standard for Gaming and Sports. It looks hyper-realistic and smooth.
*   **Download Tip**: If you are downloading a gaming highlight (e.g., League of Legends or Valorant), prioritize 60fps options over resolution. A 720p/60fps video is better than a 4K/30fps video for gaming.

---

## Decision Guide: What Should I Download?

### Scenario 1: Watching on a Phone (Data Saving)
*   **Pick**: **1080p**.
*   **Why**: It's the "Sweet Spot". It looks razor-sharp on any phone screen. It saves battery (decoding 4K makes your phone hot) and saves storage (1GB vs 4GB).

### Scenario 2: Watching on a Laptop/Monitor
*   **Pick**: **1440p (2K)** or **4K**.
*   **Why**: On a 27-inch monitor, you start to see the difference. 1080p might look slightly soft when full-screened.

### Scenario 3: Video Editing / Reposting
*   **Pick**: **4K (The Highest Available)**.
*   **Why**: Even if your final video will be 1080p, starting with 4K gives you freedom. You can "Zoom In" (Crop) up to 2x without losing quality. If you crop a 1080p video, it becomes blurry 720p.

### Scenario 4: Slow Internet / Archiving
*   **Pick**: **720p**.
*   **Why**: If you are archiving 1,000 episodes of a show, the file size difference is massive. 720p is "Good Enough" for preserving the content history without buying a new hard drive.

---

## The "Upscaling" Scam

Beware of other downloader sites that claim to convert a 720p video into 4K.
**This is impossible.** You cannot add detail that doesn't exist. They just stretch the image, making the file huge and the quality blurry.
**SSDown is Honest**: If the uploaded video is 720p, we give you 720p. We never fake the resolution.

---

## Conclusion

Don't be a slave to the "4K" label.
*   Smart users download **1080p** for consumption.
*   Creators download **4K** for production.
*   Archivists download **720p** for storage.

Choose the tool that fits the job.
    `,
    kr: `
## "거거익선(클수록 좋다)"의 함정

우리는 숫자가 높으면 무조건 좋다고 세뇌당했습니다. TV 제조사들의 4K, 8K 마케팅 때문이죠. 하지만 개인 소장용으로 영상을 다운로드할 때, 무조건 최고 해상도를 고르는 건 종종 시간과 용량 낭비입니다.

현명한 선택을 하려면 세 가지 개념을 알아야 합니다: **해상도(Resolution)**, **비트레이트(Bitrate)**, 그리고 **시청 거리**입니다.

---

## 1. 해상도: 캔버스의 크기

해상도는 단순히 이미지를 구성하는 점(픽셀)의 개수입니다.
*   **720p (HD)**: 1280 x 720 (약 90만 화소).
*   **1080p (Full HD)**: 1920 x 1080 (약 200만 화소).
*   **1440p (2K/QHD)**: 2560 x 1440 (약 370만 화소).
*   **2160p (4K/UHD)**: 3840 x 2160 (약 830만 화소).

**팩트 체크**:
아이폰 15 같은 최신 스마트폰 화면은 물리적으로 작습니다. 픽셀 밀도(PPI)가 아무리 높아도 우리 눈엔 한계가 있습니다.
팔을 뻗은 거리에서 6인치 폰 화면을 볼 때, **인간의 눈은 1080p와 4K를 구분하지 못합니다.**
버스에서 볼 영상을 4K로 받는 건, **시각적 차이는 0인데 데이터만 4배 더 쓰는 셈**입니다.

---

## 2. 비트레이트: 물감의 양

비밀을 알려드리죠. **해상도보다 비트레이트가 더 중요합니다.**
비트레이트는 초당 전송되는 데이터양(Mbps)입니다.

*   **상황 A**: 4K 해상도지만 비트레이트가 낮은 영상 (유튜브 등 저압축).
*   **상황 B**: 1080p 해상도지만 비트레이트가 높은 영상 (블루레이 급).

**결과**: 상황 B가 훨씬 좋아 보입니다. 상황 A는 픽셀 수는 많지만 '깍두기(블록 노이즈)' 현상이 생깁니다. 특히 팡파르가 터지거나 물이 튀는 복잡한 장면에서 화질이 뭉개집니다.
*   **SSDown의 철학**: 저희는 항상 **가장 높은 비트레이트의 스트림**을 가져옵니다. 깡마른 4K보다 꽉 찬 1080p가 낫습니다.

---

## 3. 프레임 (FPS): 부드러움

보통 **30fps**와 **60fps**가 있습니다.
*   **30fps**: 영화, 드라마, 일반적인 틱톡 영상.
*   **60fps**: 게임, 스포츠 영상. 움직임이 훨씬 부드럽고 현실적입니다.
*   **다운로드 팁**: 롤(LoL)이나 발로란트 매드무비를 다운받는다면, 4K 30fps보다 **1080p 60fps**를 고르세요. 게이머에게는 해상도보다 부드러움이 생명입니다.

---

## 결정 가이드: 뭘 받아야 할까요?

### 상황 1: 폰으로 볼거다 (출퇴근, 침대)
*   **선택**: **1080p**.
*   **이유**: '황금 비율'입니다. 폰 화면에서 아주 선명합니다. 배터리도 아끼고(4K 디코딩은 폰을 뜨겁게 합니다), 용량도 아낍니다(1GB vs 4GB).

### 상황 2: 노트북이나 모니터로 볼거다
*   **선택**: **1440p (2K)** 또는 **4K**.
*   **이유**: 27인치 모니터라면 차이가 보이기 시작합니다. 1080p를 전체 화면으로 늘리면 약간 흐릿할 수 있습니다.

### 상황 3: 편집 소스로 쓸거다 (재가공)
*   **선택**: **4K (가능한 최고 화질)**.
*   **이유**: 최종 결과물을 1080p로 만들더라도 소스는 4K여야 합니다. 그래야 화질 저하 없이 영상을 2배까지 **확대(Zoom/Crop)**할 수 있습니다. 1080p를 확대하면 720p가 되어버립니다.

### 상황 4: 인터넷이 느리거나 소장만 하고 싶다
*   **선택**: **720p**.
*   **이유**: 드라마 100회분을 소장하려면 용량이 문제입니다. 720p는 내용을 확인하고 추억을 보관하기에 '충분히 좋은(Good Enough)' 화질입니다.

---

## '업스케일링(Upscaling)' 사기 주의

어떤 사이트들은 720p 영상을 4K로 변환해 준다고 광고합니다.
**불가능합니다.** 없는 디테일을 창조할 순 없습니다. 그저 이미지를 강제로 늘려서 용량만 키우고 화질은 더 흐리게 만들 뿐입니다.
**SSDown은 정직합니다**: 원본이 720p면 720p를 드립니다. 숫자로 장난치지 않습니다.

---

## 결론

"4K"라는 라벨의 노예가 되지 마세요.
*   현명한 소비자는 **1080p**를 받습니다.
*   크리에이터는 **4K**를 받습니다.
*   수집가는 **720p**를 받습니다.

목적에 맞는 도구를 선택하세요.
    `,
  },
  category: "tech",
  tags: ["tech", "resolution", "4k", "1080p", "guide", "bitrate"],
  author: "SSDown Tech Team",
  publishedAt: "2025-04-28T10:15:00Z",
  updatedAt: "2025-12-17T14:40:00Z",
  image: "/logo.png",
  readTime: 6,
  status: "published",
  createdAt: "2025-04-28T10:15:00Z",
};
