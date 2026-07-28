"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6",
        "bg-white dark:bg-gray-900 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]",
        "animate-in slide-in-from-bottom duration-500"
      )}
    >
      <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Cookie className="h-6 w-6" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-semibold text-foreground">
              개인정보를 소중히 다룹니다
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              We use necessary cookies to ensure our website functions
              correctly. With your consent, we may also use third-party cookies
              (like Google AdSense & Analytics) to improve our service and serve
              relevant ads. For more information, please read our{" "}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:text-indigo-600 dark:hover:text-indigo-400"
                target="_blank"
              >
                개인정보처리방침
              </a>
              .
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none"
            onClick={accept}
          >
            필수만 허용
          </Button>
          <Button
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700"
            onClick={accept}
          >
            전체 허용
          </Button>
        </div>
      </div>
    </div>
  );
}
