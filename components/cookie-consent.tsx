"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { cn } from "@/lib/utils";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if consent is already given
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay showing to avoid layout shift immediately on load
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--pt-line-strong)] bg-white",
        "animate-in slide-in-from-bottom duration-300"
      )}
    >
      <div className="pt-wrap flex flex-col items-start gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pt-accent)]" />
          <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            <strong className="text-[var(--pt-text)]">쿠키 사용 안내</strong> —
            사이트가 정상 동작하는 데 필요한 쿠키를 사용합니다. 동의하시면 서비스
            개선과 맞춤 광고를 위해 제3자 쿠키(구글 애드센스·애널리틱스)도
            사용합니다. 자세한 내용은{" "}
            <a
              href="/privacy"
              className="text-[var(--pt-accent)] underline underline-offset-2"
              target="_blank"
            >
              개인정보처리방침
            </a>
            에서 확인하세요.
          </p>
        </div>
        <div className="flex w-full shrink-0 gap-1.5 sm:w-auto">
          <button type="button" className="pt-btn flex-1 sm:flex-none" onClick={accept}>
            필수만 허용
          </button>
          <button
            type="button"
            className="pt-btn pt-btn-primary flex-1 sm:flex-none"
            onClick={accept}
          >
            전체 허용
          </button>
        </div>
      </div>
    </div>
  );
}
