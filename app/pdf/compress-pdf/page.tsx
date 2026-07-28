import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { CompressPdfClient } from "@/components/client/compress-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "PDF 압축은 어떤 방식으로 이뤄지나요?",
    answer:
      "PDF의 각 페이지를 브라우저에서 이미지로 렌더링한 뒤, 선택한 품질로 JPEG로 다시 인코딩하고, 원래 페이지 크기를 유지한 새 PDF로 다시 만듭니다. 낮은 품질 설정일수록 해상도가 낮고 JPEG 압축이 강해져 파일이 작아집니다.",
  },
  {
    question: "압축 후에도 글자를 선택할 수 있나요?",
    answer:
      "No. Because every page is converted to an image, the resulting pages are pictures — text can no longer be selected, searched, or copied. If you need selectable text, keep the original file or choose the 고화질 preset for the best visual fidelity.",
  },
  {
    question: "어떤 품질 설정을 고르는 게 좋나요?",
    answer:
      "인쇄에 쓸 선명도를 유지하면서 용량을 줄이려면 높음(약 150 DPI)을 쓰세요. 화면으로 읽거나 이메일로 보낼 때는 보통(약 110 DPI)이 균형이 좋습니다. 선명도가 덜 중요한 웹 공유용이라면 낮음(약 72 DPI)이 가장 작은 파일을 만듭니다.",
  },
  {
    question: "제 파일이 서버에 업로드되나요?",
    answer:
      "아니요. 모든 압축은 pdf.js와 jsPDF를 이용해 전적으로 브라우저 안에서 이뤄집니다. PDF가 기기를 벗어나지 않으며 어디에도 업로드되지 않습니다.",
  },
  {
    question: "비밀번호가 걸린 PDF도 압축할 수 있나요?",
    answer:
      "암호화되었거나 비밀번호가 걸린 PDF는 대개 브라우저에서 읽을 수 없어 오류가 표시됩니다. PDF 뷰어에서 먼저 비밀번호를 해제한 뒤 압축해 주세요.",
  },
];

// Dictionary keys for this page are added separately, so read them loosely
// to keep strict typecheck green while English fallbacks render meanwhile.
interface CompressPdfDict {
  meta_title?: string;
  meta_description?: string;
  breadcrumb_title?: string;
  faq?: { question: string; answer: string }[];
}

function getCompressPdfDict(dict: unknown): CompressPdfDict {
  return (
    ((dict as Record<string, unknown>)?.page_compress_pdf as CompressPdfDict) ??
    {}
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const cp = getCompressPdfDict(dict);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/compress-pdf`;

  const title =
    cp.meta_title || "PDF 압축 - 온라인 PDF 용량 줄이기 | SSDown";
  const description =
    cp.meta_description ||
    "브라우저에서 바로 PDF 용량을 줄이세요. 품질을 고르고 얼마나 줄었는지 확인한 뒤 내려받으면 됩니다. 무료이고 빠르며 100% 비공개로 처리됩니다.";

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

export default async function CompressPdfPage() {
  const dict = await getDictionary();
  const cp = getCompressPdfDict(dict);

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const pdfToolsLabel = dict?.breadcrumb?.pdf_tools || "PDF 도구";
  const breadcrumbLabel = cp.breadcrumb_title || "PDF 압축";
  const faqItems: { question: string; answer: string }[] =
    cp.faq || FALLBACK_FAQ;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
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
      { "@type": "ListItem", position: 1, name: homeLabel, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: toolsLabel, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: pdfToolsLabel, item: "https://ssdown.app/tools/pdf" },
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/pdf/compress-pdf" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PDF 압축",
    url: "https://ssdown.app/pdf/compress-pdf",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "무료 온라인 PDF 압축 도구. 품질 설정을 조절해 브라우저에서 PDF 용량을 줄이세요. 빠르고 안전하며 비공개로 처리됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "온라인 PDF 압축 방법",
    description:
      "무료 온라인 PDF 압축 도구로 브라우저에서 안전하게 PDF 용량을 줄이세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "PDF 파일 올리기",
        text: "PDF를 선택하거나 도구 영역으로 끌어다 놓으세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "압축 품질 선택",
        text: "얼마나 줄이고 싶은지에 따라 높음, 보통, 낮음 중에서 고르세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "압축 후 다운로드",
        text: "압축을 실행해 줄어든 용량을 확인하고 작아진 PDF를 내려받으세요.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: homeLabel, href: "/" },
            { label: toolsLabel, href: "/tools" },
            { label: pdfToolsLabel, href: "/tools/pdf" },
            {
              label: breadcrumbLabel,
              href: "/pdf/compress-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <CompressPdfClient dict={dict} />
    </>
  );
}
