# GEO 감사 보고서: SSDown

**감사 날짜:** 2026-03-17
**URL:** https://ssdown.app
**비즈니스 유형:** 하이브리드 — 무료 툴 플랫폼 + 콘텐츠 퍼블리셔 + 소프트웨어 디렉토리
**분석 페이지 수:** 12개 (홈페이지, 소개, 블로그 인덱스, 블로그 포스트 2개, 툴 페이지 3개, 연락처, 소프트웨어, robots.txt, 사이트맵)

---

## 경영진 요약

**종합 GEO 점수: 36/100 (위험)**

SSDown은 대규모 콘텐츠를 보유하고 있지만(사이트맵 URL 900개+, 블로그 아티클 100개+, 툴 25개+), AI 시스템이 엔티티 인식과 인용 결정에 사용하는 권위 신호가 심각하게 부족합니다. 가장 큰 약점은 다음과 같습니다: AI 모델이 학습하는 플랫폼(Reddit, YouTube, Wikipedia, LinkedIn)에서의 브랜드 존재감 제로, 실제 자격 증명이 없는 익명 저작, 그리고 AI가 사이트의 대상 독자와 전문성을 자신 있게 분류하지 못하게 하는 이중 언어 불일치(페이지가 한국어 또는 영어로 무작위 전환). 사이트의 기술적 기반(Next.js SSR, FAQPage 스키마, BreadcrumbList)은 탄탄하여 개선의 좋은 토대가 됩니다.

### 점수 세부 내역

| 카테고리 | 점수 | 가중치 | 가중 점수 |
|---|---|---|---|
| AI 인용 가능성 | 45/100 | 25% | 11.25 |
| 브랜드 권위 | 18/100 | 20% | 3.60 |
| 콘텐츠 E-E-A-T | 35/100 | 20% | 7.00 |
| 기술적 GEO | 45/100 | 15% | 6.75 |
| 스키마 & 구조화 데이터 | 55/100 | 10% | 5.50 |
| 플랫폼 최적화 | 15/100 | 10% | 1.50 |
| **종합 GEO 점수** | | | **35.6/100** |

---

## 심각한 문제 (즉시 수정)

### 1. llms.txt 파일 없음
**URL:** https://ssdown.app/llms.txt (404)
**영향:** llms.txt를 존중하는 AI 시스템(Perplexity, Claude, GPT)이 사이트의 900개+ URL을 효율적으로 탐색할 수 없습니다. 없으면 AI 크롤러가 저가치 페이지에 크롤 예산을 낭비하고 최고의 콘텐츠를 놓칩니다.
**수정:** 사이트의 주요 페이지를 매핑하는 `/public/llms.txt` 생성:
```
# SSDown — 일상적인 작업을 위한 무료 온라인 툴
> 이미지 편집, PDF 관리, 비디오 변환, 파일 변환을 위한 무료 브라우저 기반 툴.

## 툴
- /tools: 카테고리별 모든 툴 보기
- /image/image-compressor: PNG, JPG, WebP 이미지 압축
- /video-audio/video-to-mp3: 비디오 파일을 MP3 오디오로 변환
- /tools/pdf: PDF 관리 툴

## 블로그
- /blog: 기술 가이드 및 튜토리얼 (100개+ 아티클)

## 회사
- /about: SSDown 소개
- /contact: 문의 및 지원
```

### 2. AI 인용 플랫폼에서의 브랜드 존재감 제로
**영향:** AI 모델(ChatGPT, Perplexity, Gemini)은 Reddit 스레드, YouTube 튜토리얼, Wikipedia 언급이 있는 사이트를 사용하여 "최고의 무료 이미지 압축기는 무엇인가"에 답합니다. SSDown에는 이 중 아무것도 없습니다. 이것이 AI 생성 추천에 나타나지 않는 주된 이유입니다.
**수정:** 우선순위 순서 — Reddit 먼저(가장 빠른 효과), 그 다음 YouTube 튜토리얼.

### 3. 페이지 간 심각한 언어 불일치
**영향받는 페이지:**
- `/about` — 한국어 메타 설명, 영어 H1 (혼합)
- `/image/image-compressor` — 완전 한국어 (제목, 메타, H1, 콘텐츠)
- `/video-audio/video-to-mp3` — 완전 한국어 (제목, 메타, H1, 콘텐츠)
- `/software` — 한국어 콘텐츠
- `/blog` 아티클 — 영어

**영향:** AI 시스템이 사이트의 언어나 대상 독자를 자신 있게 분류할 수 없습니다. 페이지가 무작위로 언어를 전환하면 Google의 E-E-A-T 신호가 희석됩니다. 한국어 툴 페이지가 있는 "Free Online Tools for Everyday Tasks"(영어 홈페이지) 사이트는 엔티티 이해를 혼란스럽게 합니다.
**수정:** 기본 언어 전략을 결정하세요. (A) 글로벌 독자를 대상으로 모든 페이지를 완전 영어화, 또는 (B) 각 페이지에 `/en/` 및 `/kr/` 변형을 사용한 적절한 hreflang 구현.

---

## 높은 우선순위 문제

### 4. 모든 콘텐츠에 실명 저자 없음
**영향받는 페이지:** 모든 100개+ 블로그 포스트 ("SSDown Tech Team" 또는 "SSDown Security Team" 저작)
**영향:** Google의 유용한 콘텐츠 가이드라인과 AI 모델 모두 검증 가능한 자격 증명을 가진 식별 가능한 인간 저자가 있는 콘텐츠에 보상을 줍니다. 일반적인 팀 이름은 E-E-A-T 신호를 전혀 제공하지 않습니다.
**수정:** 실명, 사진, LinkedIn 링크, 관련 자격 증명이 포함된 저자 페이지(예: `/authors/alex-kim`) 생성. 저자 페이지로 링크되도록 블로그 포스트 업데이트.

### 5. 소개 페이지가 심각하게 빈약 (250단어)
**URL:** https://ssdown.app/about
**영향:** 소개 페이지는 AI 모델이 사이트가 무엇인지, 누가 운영하는지 이해하기 위해 가장 먼저 보는 곳입니다. 팀 정보, 창업 스토리, 회사 역사, 자격 증명이 없는 250단어는 모든 E-E-A-T 테스트에 실패합니다.
**수정:** 창업 스토리, 미션, 팀원 사진과 소개, 기술 접근 방식, SSDown이 경쟁사와 다른 점을 포함하여 800단어+ 로 확장.

### 6. 홈페이지 또는 소개 페이지에 Organization 스키마 없음
**영향:** AI 시스템은 `Organization` 스키마를 사용하여 비즈니스 엔티티 관계를 이해합니다. 없으면 SSDown을 고유한 엔티티로 신뢰할 수 있게 식별할 수 없습니다.
**수정:** 홈페이지와 소개 페이지에 JSON-LD 추가:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SSDown",
  "url": "https://ssdown.app",
  "logo": "https://ssdown.app/logo.png",
  "description": "이미지 편집, PDF 관리, 비디오 변환, 파일 변환을 위한 무료 온라인 툴.",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@ssdown.app",
    "contactType": "customer support"
  },
  "sameAs": []
}
```

### 7. 핵심 소셜 미디어 다운로더 페이지가 모든 크롤러에서 차단됨
**robots.txt 항목:**
```
Disallow: /x/
Disallow: /tiktok/
Disallow: /instagram/
Disallow: /facebook/
Disallow: /dailymotion/
Disallow: /9gag/
```
**영향:** 이 페이지들은 사이트의 주요 제품 가치를 나타냅니다. 차단하면 AI 시스템이 SSDown이 이러한 플랫폼에 대한 비디오 다운로드 기능을 제공한다는 것을 알 수 없습니다. "TikTok 비디오 다운로드 방법"을 묻는 사용자는 AI 추천을 통해 SSDown을 절대 찾지 못할 것입니다.
**참고:** 법적 이유(DMCA 우려)로 이 페이지들을 차단하는 경우, DMCA를 유발하지 않고 서비스를 설명하는 SEO 안전 랜딩 페이지를 해당 경로에 만들고, 실제 툴을 다른 경로(예: `/tools/tiktok-downloader`)로 이동하는 것을 고려하세요.

### 8. 블로그 아티클에 외부 인용 제로
**예시:** "Spot Fake Video Downloaders & Avoid Malware (2025)"는 소스 링크 없이 "사이버보안 회사들이 2024년 멀웨어 40% 증가 보고"를 인용합니다.
**영향:** AI 시스템은 부분적으로 외부 인용을 통해 콘텐츠 신뢰성을 평가합니다. 출처 없는 통계는 인용할 가치 있는 권위 있는 정보가 아닌 마케팅 주장으로 취급됩니다.
**수정:** 각 통계나 데이터 포인트에 대해 원본 소스(보안 보고서, 연구 논문, 뉴스 기사)로 링크 추가.

---

## 중간 우선순위 문제

### 9. 연락처 페이지에 ContactPage 또는 WebPage 스키마 없음
**URL:** https://ssdown.app/contact
**수정:** 이메일 및 응답 시간 정보가 포함된 `ContactPage` 스키마 추가.

### 10. 소프트웨어 페이지에 SoftwareApplication 스키마 없음
**URL:** https://ssdown.app/software
**영향:** 600개+ 소프트웨어 목록에 `SoftwareApplication` 스키마가 없습니다. 이것은 소프트웨어 디렉토리를 위한 가장 높은 인용 가능성을 가진 스키마 유형입니다.
**수정:** 개별 소프트웨어 목록 페이지에 `SoftwareApplication` 스키마 추가.

### 11. 저자를 위한 Person 스키마 없음
**영향:** 저자 페이지가 생성되더라도, LinkedIn/GitHub로의 `sameAs` 링크가 있는 `Person` 스키마가 저자 엔티티 인식을 증폭시킵니다.

### 12. 블로그 포스트에 Open Graph 이미지 없음
**영향:** 소셜 플랫폼에서 공유될 때(이후 색인화되어 브랜드 권위를 높임), OG 이미지가 없는 포스트는 참여도가 현저히 낮습니다.

### 13. 로고 이미지에 Alt 텍스트 없음
**URL:** 여러 페이지 — `/_next/image?url=%2Flogo.png`
**영향:** 사소한 접근성 및 이미지 색인화 문제.

---

## 낮은 우선순위 문제

### 14. 툴 페이지의 제목 계층 구조 문제
툴 페이지는 한국어로 H1을 사용하지만 나머지 사이트 탐색은 영어입니다. 언어 간 일관성 없는 제목 구조는 AI 이해를 저하시킵니다.

### 15. RSS 피드 감지되지 않음
RSS 피드를 제공하는 퍼블리셔는 AI 집계자에게 정기적인 콘텐츠 업데이트와 콘텐츠 권위의 신호를 줍니다.

### 16. 툴 페이지에 변경 로그 또는 콘텐츠 업데이트 날짜 없음
툴 페이지에 표시되는 "최종 업데이트" 날짜가 없어 신선도 신호가 감소합니다.

---

## 카테고리별 심층 분석

### AI 인용 가능성 (45/100)

**강점:**
- 툴 페이지에 각 5개의 Q&A 쌍이 있는 훌륭한 `FAQPage` 스키마 — 사이트에서 가장 우수한 단일 GEO 신호
- 블로그 아티클 평균 2,800단어+, 명확한 제목 구조(H2/H3 계층)
- 블로그 포스트의 비교 표("안전 vs. 안전하지 않은 다운로더 특성")는 높은 인용 가능성
- 단계별 번호 매기기 목록은 AI 시스템이 쉽게 추출 가능

**약점:**
- 모든 통계가 출처 없음 (예: "2024년 멀웨어 40% 증가" 인용 없음)
- 아티클 인트로가 답변 우선이 아닌 주제 설정 방식 (AI는 즉시 질문에 답하는 콘텐츠를 선호)
- 아티클 상단에 "Quick Answer" 또는 "TL;DR" 요약 블록 없음
- 최고의 콘텐츠(소셜 미디어 다운로더)가 크롤러에게 차단됨

**재작성 예시:**
현재 도입부: *"The Wild West of Video Downloaders in 2025..."*
GEO 최적화: *"2025년에 안전하게 비디오를 다운로드하려면 설치나 계정 생성이 필요 없는 브라우저 기반 툴을 사용하세요. 가짜 비디오 다운로더의 징후: .exe 파일 다운로드 요구, 필수 브라우저 확장 프로그램, 관련 없는 사이트로의 리디렉션. 식별하고 피하는 방법:"*

### 브랜드 권위 (18/100)

**플랫폼 존재감 현황:**
| 플랫폼 | 상태 |
|---|---|
| Reddit | 언급 없음 |
| YouTube | 튜토리얼 또는 리뷰 없음 |
| Wikipedia | 항목 없음 |
| LinkedIn | 회사 페이지 감지되지 않음 |
| Twitter/X | 존재감 없음 |
| 네이버 (한국) | 인증됨 (한국 시장에 긍정적 신호) |
| Google | 인증됨 |
| ProductHunt | 미확인 (추천) |

**평가:** SSDown은 자체 도메인 외부에서는 사실상 알려지지 않았습니다. "최고의 무료 이미지 압축기" 또는 "TikTok 비디오 다운로드 방법"에 답하는 AI 모델은 다른 사이트의 Reddit 스레드, YouTube 튜토리얼, 블로그 포스트에서 추천을 구성합니다. SSDown에는 이 중 아무것도 없습니다. 이것이 사이트의 가장 큰 GEO 격차이며 개선 ROI가 가장 높은 영역입니다.

### 콘텐츠 E-E-A-T (35/100)

**경험(Experience):** 낮음 — 사용자 후기, 사례 연구, "우리 사용자들이 X개의 파일을 처리했습니다" 유형의 소셜 증명 없음.

**전문성(Expertise):** 낮음 — 일반적인 팀 이름, 자격 증명 없음, 저자 페이지 없음. 보안 블로그 포스트는 지식이 있어 보이지만 귀속 불가.

**권위(Authoritativeness):** 낮음 — 인정받는 기술 출판물의 백링크 없음, 다른 사이트에서의 인용 없음, 업계 인정 없음.

**신뢰성(Trustworthiness):** 보통 — 프라이버시 우선 메시지가 일관되고, HTTPS, Google 인증, 명확한 연락 이메일, DMCA 정책 언급. 플랫폼 ToS 준수에 관한 교육적 면책 조항은 긍정적인 신뢰 신호.

**소개 페이지 품질:** 불량 — 250단어, 팀 사진 없음, 개인 이름 없음, 창업 스토리 없음, 회사 구조에 대한 투명성 없음.

### 기술적 GEO (45/100)

**AI 크롤러 접근:**
- `robots.txt`는 기본 규칙으로 `Allow: /`와 함께 `User-agent: *` 사용 — 기본적으로 모든 AI 크롤러 허용
- `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`에 대한 명시적 규칙 없음 — 허용도 차단도 아님
- 핵심 제품 페이지(`/x/`, `/tiktok/`, `/instagram/`, `/facebook/`, `/dailymotion/`, `/9gag/`)는 모든 크롤러에서 차단
- 툴 페이지(`/image/`, `/video-audio/`, `/tools/`)는 접근 가능 ✓

**렌더링:** App Router와 SSR을 갖춘 Next.js 16 — AI 크롤러에 탁월. 콘텐츠가 서버 렌더링되어 JavaScript에 의존하지 않음. ✓

**사이트맵:** 900개+ URL로 존재 ✓. 툴, 블로그, 소프트웨어 목록 포함.

**llms.txt:** 없음 ✗ (높은 우선순위 수정)

**페이지 속도:** Turbopack이 포함된 Next.js는 빠른 빌드 시간 제공. SSR이 클라이언트 사이드 렌더링 병목 감소. ✓

**헤더:** 표준 Next.js 헤더. SharedArrayBuffer를 활성화하기 위해 특정 툴(video-to-mp3, background-remover)에 COOP/COEP 헤더 설정. ✓

### 스키마 & 구조화 데이터 (55/100)

**발견된 스키마:**

| 페이지 | 스키마 유형 | 품질 |
|---|---|---|
| 홈페이지 | WebSite | 불완전 (Organization 없음) |
| 블로그 포스트 | Article, Organization, BreadcrumbList, ImageObject | 양호 |
| 툴 페이지 | FAQPage, BreadcrumbList | 양호 |
| 소프트웨어 페이지 | BreadcrumbList | 최소 |
| 연락처 | 없음 | 누락 |
| 소개 | 불분명 | 검토 필요 |

**누락된 스키마:**
- 홈페이지/소개에 `sameAs` 링크가 있는 `Organization`
- 소프트웨어 목록의 `SoftwareApplication`
- 연락처 페이지의 `ContactPage`
- 저자를 위한 `Person` 스키마
- 온라인 툴을 위한 `WebApplication` 또는 `SoftwareApplication`
- 툴 안내 섹션의 `HowTo` 스키마

**유효성 검사 문제:**
- `Article` 스키마의 로고 이미지가 일부 경우 명시적인 alt 텍스트 없이 로드됨
- `Article` 스키마에서 `Organization`이 참조되지만 사이트 수준에서 정의되지 않음

### 플랫폼 최적화 (15/100)

SSDown의 AI 학습 플랫폼에서의 존재감은 사실상 제로입니다. 한국 시장(네이버 인증)이 유일한 주목할 만한 플랫폼 신호입니다. 글로벌 영어권 사용자를 대상으로 하는 툴의 경우, 이는 심각한 격차를 나타냅니다.

**추천 플랫폼 전략:**
1. **Reddit:** r/software, r/privacy, r/DataHoarder, r/productivity에 진정으로 도움이 되는 가이드 게시
2. **YouTube:** 각 툴 카테고리별 2분 튜토리얼 비디오 제작
3. **ProductHunt:** 기술 독자 노출을 위해 툴을 제품으로 런칭
4. **GitHub:** 개발자 커뮤니티 링크를 얻기 위해 유틸리티 컴포넌트 오픈소스화
5. **LinkedIn:** 정기적인 툴 팁이 포함된 회사 페이지 생성

---

## 즉시 실행 가능한 개선 사항 (이번 주 구현)

1. **llms.txt 생성** — 1시간 작업, Perplexity, Claude, GPT 크롤러 전반에 AI 크롤러 효율성에 즉각적인 영향
2. **홈페이지에 Organization JSON-LD 추가** — 30분, ssdown.app에 대한 AI 엔티티 인식 활성화
3. **소개 페이지 언어 수정** — 한국어 메타 설명을 영어로 변경, 글로벌 독자를 위해 모든 내용을 영어로 통일
4. **/contact에 `ContactPage` 스키마 추가** — 15분, 간단한 스키마 격차 해소
5. **상위 5개 블로그 포스트에 외부 소스 링크 추가** — 통계를 원본 소스(보안 보고서, 기술 출판물)로 연결하여 AI의 콘텐츠 신뢰도 향상

---

## 30일 실행 계획

### 1주차: 기술적 기반
- [ ] `/public/llms.txt`에 `llms.txt` 생성 및 배포
- [ ] 홈페이지와 소개 페이지에 `Organization` 스키마 추가
- [ ] 언어 일관성 수정: 모든 툴 페이지를 영어로 표준화 (또는 적절한 hreflang 구현)
- [ ] /contact에 `ContactPage` 스키마 추가
- [ ] robots.txt에 `GPTBot`, `ClaudeBot`, `PerplexityBot`에 대한 명시적 AI 크롤러 허용 규칙 추가

### 2주차: 저자 & E-E-A-T
- [ ] 실제 자격 증명(또는 일관된 정체성을 가진 필명)으로 2-3개의 실명 저자 프로필 생성
- [ ] 소개, 사진, 전문 분야가 포함된 `/authors/[name]`에 저자 페이지 구축
- [ ] LinkedIn 링크가 있는 `sameAs`를 가진 저자 페이지에 `Person` 스키마 추가
- [ ] 팀 섹션, 창업 스토리, 미션이 포함된 소개 페이지를 800단어+로 재작성
- [ ] 모든 블로그 포스트를 실명 저자로 연결되도록 업데이트

### 3주차: 콘텐츠 인용 가능성
- [ ] 상위 10개 블로그 포스트에 "빠른 답변" 요약 박스 추가
- [ ] 블로그 아티클의 모든 통계에 외부 인용 추가
- [ ] 툴 안내 섹션에 `HowTo` 스키마 추가
- [ ] "최고의 무료 이미지 압축 툴 비교" 아티클 작성 (비교 콘텐츠는 높은 인용 가능성)
- [ ] 상위 20개 소프트웨어 목록에 `SoftwareApplication` 스키마 추가

### 4주차: 브랜드 권위
- [ ] Reddit 계정 생성 및 3개의 진정으로 도움이 되는 툴 가이드 게시 (홍보성 제외)
- [ ] ProductHunt에 SSDown 등록
- [ ] LinkedIn 회사 페이지 생성
- [ ] 가장 인기 있는 툴 5개에 대한 YouTube 튜토리얼 시리즈 계획
- [ ] 게스트 포스트 또는 툴 리뷰 커버리지를 위해 3개의 기술 블로그에 접근

---

## 부록: 분석된 페이지

| URL | 제목 | 주요 GEO 문제 |
|---|---|---|
| https://ssdown.app | Free Online Tools for Everyday Tasks | Organization 스키마 없음, 소셜 링크 없음 |
| https://ssdown.app/about | SSDown 소개 (About SSDown) | 한국어 메타 + 영어 H1 불일치, 250단어뿐, 팀 정보 없음 |
| https://ssdown.app/blog | Creator Hub | 일반적인 "SSDown Tech Team" 저자, 저자 스키마 없음 |
| https://ssdown.app/blog/safe-downloader-guide-2025 | Spot Fake Video Downloaders | 좋은 구조, 외부 인용 없음, 일반적인 저자 |
| https://ssdown.app/contact | Contact SSDown | ContactPage 스키마 없음, 이메일만 있음 |
| https://ssdown.app/image/image-compressor | 이미지 압축기 | 완전 한국어 콘텐츠 — 언어 불일치 |
| https://ssdown.app/video-audio/video-to-mp3 | 비디오를 MP3로 변환 | 완전 한국어 콘텐츠 — 언어 불일치 |
| https://ssdown.app/software | 소프트웨어 카테고리 | 한국어, SoftwareApplication 스키마 없음 |
| https://ssdown.app/robots.txt | — | 핵심 제품 페이지 차단, AI 전용 규칙 없음 |
| https://ssdown.app/sitemap.xml | — | 900개+ URL, 잘 구조화됨 ✓ |
| https://ssdown.app/llms.txt | — | 파일 없음 (404) |

---

*이 보고서는 ssdown.app의 AI 엔진 가시성 최적화를 위한 GEO 감사로 생성되었습니다.*
