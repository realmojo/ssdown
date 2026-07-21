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

// Reserve vertical space per format so the async-loaded ad expands into
// pre-allocated height instead of pushing content down (avoids layout shift).
const MIN_HEIGHT: Record<NonNullable<AdsenseProps["format"]>, number> = {
  horizontal: 100,
  rectangle: 250,
  vertical: 250,
  auto: 280,
};

export default function Adsense({ slotId, format = "auto" }: AdsenseProps) {
  const isDev = process.env.NODE_ENV === "development";
  const minHeight = MIN_HEIGHT[format];

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
        className="adsense-dev text-white bg-gray-800 w-full flex items-center justify-center text-xs text-gray-400"
        style={{ minHeight }}
      >
        AD {slotId}
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%", minHeight }}
      data-ad-client="ca-pub-9130836798889522"
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
