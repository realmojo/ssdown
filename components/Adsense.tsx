// components/Adsense.tsx
"use client";
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}
import { useEffect } from "react";

type AdsenseProps = {
  slotId: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
};

export default function Adsense({ slotId, format = "auto" }: AdsenseProps) {
  const isDev = process.env.NODE_ENV === "development";

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!isDev) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("Adsense load error", e);
      }
    }
  }, [slotId]);

  if (isDev) {
    return (
      <div
        className="adsense-dev text-white bg-gray-800 w-full flex items-center justify-center text-xs text-gray-400 py-4"
        style={{ height: "auto" }}
      >
        AD {slotId}
      </div>
    );
  }

  // 높이를 고정하지 않고 애드센스가 결정한 크기에 맡긴다.
  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%", height: "auto" }}
      data-ad-client="ca-pub-9130836798889522"
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
