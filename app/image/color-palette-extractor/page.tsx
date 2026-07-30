import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { ColorPaletteExtractorClient } from "@/components/client/color-palette-extractor-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/color-palette-extractor`;

  const title = dict.page_color_palette_extractor.meta_title;
  const description = dict.page_color_palette_extractor.meta_description;

  return {
    title,
    description,
    alternates: buildAlternates(new URL(canonical).pathname),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

export default async function ColorPaletteExtractorPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_color_palette_extractor.faq.map((item: { question: string; answer: string }) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.image_tools, item: "https://ssdown.app/tools/image" },
      { "@type": "ListItem", position: 4, name: dict.page_color_palette_extractor.breadcrumb_title, item: "https://ssdown.app/image/color-palette-extractor" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "컬러 팔레트 추출기",
    url: "https://ssdown.app/image/color-palette-extractor",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "어떤 이미지에서든 주요 색상을 뽑아 아름다운 팔레트를 만들어 줍니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "컬러 팔레트 추출기 사용 방법",
    description: "어떤 이미지에서든 주요 색상을 뽑아 아름다운 팔레트를 만들어 줍니다.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "이미지 업로드",
        text: "컬러를 추출하려는 이미지를 선택하세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "색상 개수 조절",
        text: "슬라이더를 이용해 3개에서 12개 사이의 주요 색상을 선택하세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "복사 및 저장",
        text: "개별 색상 코드를 복사하거나 전체 팔레트를 이미지로 저장하세요.",
      }
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <PageShell
        sidebar={false}
        crumbs={[
          { label: dict.breadcrumb.tools, href: "/tools" },
          { label: dict.breadcrumb.image_tools, href: "/tools/image" },
          { label: dict.page_color_palette_extractor.breadcrumb_title },
        ]}
      >
        <ColorPaletteExtractorClient dict={dict} />
      </PageShell>

      {/* Mood Palette 관련 도구 배너 */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <a
          href="https://moodpalette.ssdown.app"
          target="_blank"
          rel="noopener"
          className="flex items-center justify-between gap-4 bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-5 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">이런 도구도 있어요</p>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-violet-600 transition-colors">
              무드 팔레트 — AI 색상 팔레트 생성기
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              분위기, 키워드, 이미지로 아름다운 색상 팔레트를 만들어 보세요. 무료 온라인 도구입니다.
            </p>
          </div>
          <span className="shrink-0 text-2xl">🎨</span>
        </a>
      </div>
    </>
  );
}
