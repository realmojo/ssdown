import { Post } from "./types";

export const post: Post = {
  id: "safe-browsing-tips",
  title: {
    en: "The Cybersecurity Handbook: How to Spot Fake Video Links and Avoid Malware",
    kr: "해커로부터 내 폰을 지키는 법: 가짜 동영상 링크 식별과 안전한 인터넷 수칙",
  },
  excerpt: {
    en: "The internet is full of traps. Learn how to identify phishing URLs, avoid 'Drive-by Downloads', and why choosing a secure downloader like SSDown protects your digital life.",
    kr: "인터넷은 온갖 함정으로 가득합니다. 피싱 URL을 구별하는 눈을 기르고, '드라이브 바이 다운로드' 같은 악성 공격을 막는 법, 그리고 왜 SSDown 같은 안전한 도구를 써야 하는지 알려드립니다.",
  },
  content: {
    en: `
## "Hey, is this you in this video?"

We have all seen it. A DM from a friend (whose account was hacked) with a suspicious link. Or a text message saying you missed a package delivery. In the digital age, clicking the wrong link can cost you your passwords, your bank account, or your identity.

Video downloading is a particularly high-risk activity. Why? because users are often looking for "Free" stuff, and hackers know this is the perfect bait.

This guide will turn you into a human firewall.

---

## The Anatomy of a Malicious Link

### 1. Typosquatting (The Lookalike Trick)
Hackers buy domains that look *almost* like the real thing.
*   **Real**: \`instagram.com\`
*   **Fake**: \`instagran.com\` (with an 'n'), \`lnstagram.com\` (lowercase 'L' instead of 'I').
*   **Tip**: Always read the URL carefully before entering your password.

### 2. The URL Shortener Mask
Bit.ly or TinyURL services are great for marketers but loved by scammers because they hide the final destination.
*   **Tip**: Use a "URL Expander" service or simply hover your mouse over the link (on PC) to see the preview at the bottom left of your browser.

### 3. The "Codecs Needed" Lie
You visit a video site, but the video won't play. A popup says: *"You need to install this HD Player/Codec to watch."*
*   **Fact**: Modern browsers (Chrome, Safari) can play 99.9% of all videos natively.
*   **Danger**: That "Codec" is actually **Malware** or **Ransomware**. Never, ever download an \`.exe\` or \`.apk\` to watch a video.

---

## Dangerous Downloader Sites: Red Flags

Not all downloader tools are created equal. The internet is littered with sketchy sites. Here are the signs you are in a dangerous place:

*   **Pop-up Storms**: You click the input box, and 3 new tabs open with betting ads or porn.
*   **"Your Phone is Infected!"**: Detailed fake alerts vibrating your phone saying you have 38 viruses. (This is scareware).
*   **Notification Spam**: The site asks to "Allow Notifications" to prove you are not a robot. If you say yes, they will spam your desktop with ads forever.

**Why SSDown is Different**:
We adhere to a strict **"Clean Web" Policy**.
*   **No Pop-ups**: Use our tool, stay on our page.
*   **No False Alerts**: We don't scare you.
*   **No Installations**: We deliver standard MP4 files. Nothing executable.

---

## Pro Tip: How to Analyze a Suspicious Video Link

Before you click that link your "friend" sent you, try this workflow:

1.  **Don't Click, Copy**: Long-press the link and select "Copy".
2.  **Paste into SSDown**:
    *   This might sound surprising, but our server acts as a **Safety Buffer**.
    *   If you paste \`evil-site.com/exploit.mp4\` into SSDown, our server will try to parse it as an Instagram/TikTok link.
    *   It will obviously fail and say "Invalid URL".
    *   **Success**: You just avoided visiting the malicious site directly. Your browser stayed safe on SSDown.
3.  **VirusTotal**: If you are really paranoid, paste the link into **VirusTotal.com**. It scans the URL with 70+ antivirus engines.

---

## General Safety Hygiene

### 1. Update Your Browser
Chrome and Safari release security patches almost weekly. They fix loopholes that hackers use for "Drive-by Downloads" (where malware installs just by visiting a site). Keep them updated.

### 2. Use a Password Manager
Never reuse passwords. If a shady video site gets hacked, they will try your password on your email and bank. Use 1Password, LastPass, or Apple Keychain.

### 3. Enable 2FA (Two-Factor Authentication)
Even if someone steals your Instagram password through a fake login page, they can't get in without the SMS code or Authenticator app code.

---

## Conclusion

The internet is a jungle. You need to be alert.
*   Real video sites don't ask you to install "Players".
*   Real login pages don't have typos in the URL.
*   Real tools like **SSDown** don't spam you with pop-ups.

Stay vigilant, verify before you verify, and use trusted tools to act as your shield.
    `,
    kr: `
## "어? 이거 너 영상 아니야?"

누구나 한 번쯤 받아봤을 겁니다. 해킹당한 친구 계정으로 온 의심스러운 DM, 혹은 "택배 배송 주소가 잘못되었습니다"라는 문자 메시지(스미싱). 디지털 시대에 링크 하나를 잘못 누르는 것은 계정 비밀번호, 은행 잔고, 심지어 신원 도용으로 이어질 수 있습니다.

특히 '무료 영상 다운로드', '유출 영상' 같은 키워드는 해커들이 가장 좋아하는 미끼입니다. 사용자가 무언가를 얻으려는 욕심에 보안 의식을 낮추기 때문입니다.

이 가이드는 여러분을 인간 방화벽(Firewall)으로 만들어 드립니다.

---

## 악성 링크의 해부학

### 1. 타이포스쿼팅 (유사 도메인 사기)
해커들은 실제 사이트와 *거의* 비슷해 보이는 주소를 구매합니다.
*   **진짜**: \`instagram.com\`
*   **가짜**: \`instagran.com\` (m 대신 n), \`lnstagram.com\` (소문자 L).
*   **팁**: 비밀번호를 입력하기 전에는 주소창을 글자 단위로 꼼꼼히 읽는 습관을 들이세요.

### 2. 단축 URL의 가면
\`bit.ly\`나 \`han.gl\` 같은 서비스는 마케팅용으론 좋지만, 최종 목적지를 숨길 수 있어 사기꾼들이 애용합니다.
*   **팁**: 모르는 사람이 보낸 단축 링크는 절대 바로 누르지 마세요. PC라면 마우스를 올려 브라우저 왼쪽 하단의 미리보기를 확인하세요.

### 3. "코덱이 필요합니다" 거짓말
영상 사이트에 들어갔는데 재생이 안 되고, *"이 영상을 보려면 HD 플레이어/코덱을 설치하세요"*라는 팝업이 뜹니다.
*   **팩트**: 크롬, 사파리, 엣지 등 현대 브라우저는 전 세계 영상의 99.9%를 자체 재생할 수 있습니다.
*   **위험**: 그 '코덱' 파일은 사실 **랜섬웨어**나 **스파이웨어**입니다. 영상을 보기 위해 \`.exe\` 파일이나 \`.apk\` 파일을 설치하라는 말은 100% 사기입니다.

---

## 위험한 다운로더 사이트 구별법

모든 다운로드 도구가 SSDown처럼 깨끗하지 않습니다. 인터넷은 지뢰밭입니다. 다음과 같은 징후가 보이면 즉시 뒤로 가기를 누르세요.

*   **팝업 폭탄**: 입력창을 클릭했을 뿐인데 도박, 성인광고 창이 3개나 뜹니다.
*   **"바이러스 감염!" 경고**: 폰이 막 진동하면서 "38개의 바이러스가 발견되었습니다. 치료하려면 클릭하세요"라고 뜹니다. (전형적인 공포 마케팅, Scareware입니다).
*   **알림 허용 강요**: "로봇이 아님을 증명하려면 '허용'을 누르세요"라며 브라우저 알림 권한을 요구합니다. 누르면 바탕화면에 광고가 도배됩니다.

**SSDown은 다릅니다**:
저희는 엄격한 **'클린 웹(Clean Web)'** 정책을 준수합니다.
*   **No Pop-ups**: 이상한 창이 뜨지 않습니다.
*   **No Scareware**: 거짓 경고로 겁주지 않습니다.
*   **No Install**: 오직 표준 MP4 파일만 제공합니다. 실행 파일은 취급하지 않습니다.

---

## 프로 팁: 의심스러운 링크 안전하게 검사하기

친구가 보낸 수상한 링크, 누르기 찜찜하다면 이렇게 하세요.

1.  **클릭 금지, 복사 필수**: 링크를 꾹 눌러서 '복사'만 하세요.
2.  **SSDown에 붙여넣기**:
    *   놀랍게도 저희 서버가 **안전 완충지대(Safety Buffer)** 역할을 해줍니다.
    *   만약 해킹 사이트 주소를 SSDown 입력창에 넣으면, 저희 서버가 먼저 가서 인스타그램/틱톡 주소인지 분석합니다.
    *   당연히 형식이 다를 테니 "Invalid URL(유효하지 않은 주소)" 에러를 띄웁니다.
    *   **성공**: 여러분은 악성 사이트에 직접 접속하지 않고도 안전하게 링크를 걸러냈습니다.
3.  **VirusTotal**: 정말 의심스럽다면 \`virustotal.com\`에 링크를 넣어보세요. 70개 이상의 백신 엔진이 동시에 검사해 줍니다.

---

## 기본적인 보안 위생 수칙

### 1. 브라우저 업데이트
크롬과 사파리는 거의 매주 보안 패치를 내놓습니다. 해커들이 사이트 방문만으로도 악성코드를 심는 '드라이브 바이 다운로드' 취약점을 막기 위해서입니다. 업데이트를 미루지 마세요.

### 2. 비밀번호 재사용 금지
허접한 영상 사이트가 해킹당해서 여러분의 아이디/비번이 털렸다고 칩시다. 만약 뱅킹 비밀번호도 똑같다면? 끝장입니다. 1Password나 삼성 패스, 애플 키체인을 쓰세요.

### 3. 2단계 인증 (2FA) 필수
누군가 피싱 사이트를 통해 인스타 비번을 알아냈다 해도, 여러분의 폰으로 오는 문자 인증번호나 OTP가 없으면 로그인할 수 없게 만드세요.

---

## 결론

인터넷은 정글입니다. 항상 깨어 있어야 합니다.
*   진짜 영상 사이트는 프로그램 설치를 요구하지 않습니다.
*   진짜 로그인 페이지는 주소창에 오타가 없습니다.
*   **SSDown** 같은 진짜 도구는 팝업 폭탄을 띄우지 않습니다.

의심하고, 확인하고, 검증된 도구를 방패 삼아 안전하게 즐기세요.
    `,
  },
  category: "security",
  tags: ["security", "safety", "phishing", "malware", "guide"],
  author: "SSDown Security Team",
  publishedAt: "2024-04-08T10:00:00Z",
  updatedAt: "2024-12-17T14:00:00Z",
  image: "/logo.png",
  readTime: 5,
  status: "published",
  createdAt: "2024-04-08T10:00:00Z",
};
