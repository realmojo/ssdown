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
      <div className="adsense-dev text-white bg-gray-800 min-h-[320px] w-full">
        애드센스 {slotId}
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%" }}
      data-ad-client="ca-pub-9130836798889522"
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
