import Script from "next/script";
import { FunctionComponent } from "react";

export const AdsenseInit: FunctionComponent = () => {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9130836798889522`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};
