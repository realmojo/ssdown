"use client";

interface SiteFooterProps {
  dict: any;
}

export function SiteFooter({ dict }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-xl">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <a target="_self" href="/" className="inline-block">
              <span className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300">
                SSDown
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              이미지 편집, PDF 관리, 영상 변환 등을 위한 무료 온라인 도구. 빠르고 무료이며 안전합니다.
            </p>
          </div>

          {/* Tools Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              도구
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  target="_self"
                  href="/tools/image"
                  className="hover:text-primary transition-colors"
                >
                  이미지 도구
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/tools/video-audio"
                  className="hover:text-primary transition-colors"
                >영상 & 오디오</a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/tools/social-text"
                  className="hover:text-primary transition-colors"
                >소셜 & 텍스트</a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/tools/utility"
                  className="hover:text-primary transition-colors"
                >
                  유틸리티
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/tools"
                  className="hover:text-primary transition-colors"
                >
                  전체 도구
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">회사</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  target="_self"
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  {dict?.about?.nav || dict?.nav?.about || "소개"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  {dict?.contact?.nav || dict?.nav?.contact || "문의하기"}
                </a>
              </li>
            </ul>
          </div>

          {/* Related Sites Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              관련 사이트
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://moodpalette.ssdown.app"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-primary transition-colors"
                >
                  무드 팔레트
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">법적 고지</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  target="_self"
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  {dict?.privacy || "개인정보처리방침"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  {dict?.terms || "이용약관"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} SSDown. 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  );
}
