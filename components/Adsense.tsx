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
};

export default function Adsense({ slotId }: AdsenseProps) {
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
      <div className="w-full adsense-dev text-white bg-gray-800 min-h-[320px]">
        애드센스 {slotId}
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9130836798889522"
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
