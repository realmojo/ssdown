import { AboutClient } from "@/components/client/about-client";
import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/about`;

  return {
    title: "SSDown 소개 - 무료 온라인 도구 플랫폼",
    description:
      "이미지 편집, PDF 관리, 영상 변환을 위한 무료·안전·브라우저 기반 도구를 제공하는 SSDown의 목표를 소개합니다. 저희 이야기와 개인정보 보호에 대한 약속을 확인하세요.",
    openGraph: {
      title: "SSDown 소개 - 무료 온라인 도구 플랫폼",
      description: "이미지 편집, PDF 관리, 영상 변환을 위한 무료·안전·브라우저 기반 도구를 제공하는 SSDown의 목표를 소개합니다.",
      url: canonical,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function AboutPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SSDown",
    url: "https://ssdown.app",
    logo: "https://ssdown.app/logo.png",
    description: "이미지 편집, PDF 관리, 영상 변환, 파일 형식 변환을 위한 무료 온라인 도구. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "",
      contactType: "customer support",
      email: "support@ssdown.app",
      url: "https://ssdown.app/contact"
    },
    sameAs: ["https://twitter.com/ssdown"]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
      />
      <AboutClient />
    </>
  );
}
