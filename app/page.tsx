import { Metadata } from "next";
import { HomeClient } from "@/components/client/home-client";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "SSDown - 일상에 필요한 무료 온라인 도구",
  description:
    "이미지 편집, PDF 관리, 영상 변환, 파일 형식 변환을 위한 무료 온라인 도구. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
  keywords: [
    "무료 온라인 도구",
    "이미지 압축",
    "PDF 도구",
    "영상 변환",
    "파일 변환",
    "브라우저 기반 도구",
    "온라인 이미지 편집",
  ],
  openGraph: {
    title: "SSDown - 무료 온라인 도구",
    description:
      "이미지 편집, PDF 관리, 영상 변환, 파일 형식 변환을 위한 무료 온라인 도구. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
    url: "https://ssdown.app",
    siteName: "SSDown",
    images: [
      {
        url: "https://ssdown.app/logo.png",
        width: 1200,
        height: 630,
        alt: "SSDown - 무료 온라인 도구",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSDown - 무료 온라인 도구",
    description:
      "이미지 편집, PDF 관리, 영상 변환, 파일 형식 변환을 위한 무료 온라인 도구입니다.",
    images: ["https://ssdown.app/logo.png"],
  },
  alternates: buildAlternates(""),
  };
}

export default function Home() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SSDown - 무료 온라인 도구",
    url: "https://ssdown.app",
    description:
      "이미지 편집, PDF 관리, 영상 변환, 파일 형식 변환을 위한 무료 온라인 도구. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
    about: {
      "@type": "Thing",
      name: "온라인 도구 플랫폼",
      description:
        "이미지 편집, PDF 관리, 영상·오디오 변환, 파일 형식 변환을 아우르는 무료 브라우저 기반 도구 모음입니다.",
    },
    audience: {
      "@type": "Audience",
      audienceType:
        "콘텐츠 창작자, 디자이너, 개발자, 학생, 실무자",
    },
    keywords:
      "무료 온라인 도구, 이미지 압축, PDF 도구, 영상 변환, 파일 변환, 브라우저 기반 도구",
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SSDown",
    url: "https://ssdown.app",
    logo: "https://ssdown.app/logo.png",
    description:
      "이미지 편집, PDF 관리, 영상 변환, 파일 형식 변환을 위한 무료 온라인 도구. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: "https://ssdown.app/contact",
    },
    sameAs: ["https://twitter.com/ssdown"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
