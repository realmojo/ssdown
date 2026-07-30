import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { PasswordGeneratorClient } from "@/components/client/password-generator-client";
import { PageShell } from "@/components/portal/page-shell";

const META_TITLE = "비밀번호 생성기 - 안전한 비밀번호 만들기 | SSDown";
const META_DESCRIPTION =
  "무료 온라인 비밀번호 생성기. 길이와 문자 종류를 직접 정해 강력하고 무작위한 안전한 비밀번호를 만드세요. 100% 브라우저에서 실행됩니다.";
const BREADCRUMB_TITLE = "비밀번호 생성기";
const CANONICAL = "https://ssdown.app/utility/password-generator";

const faq = [
  {
    question: "생성된 비밀번호는 안전한가요?",
    answer:
      "네. 비밀번호는 브라우저의 암호학적으로 안전한 난수 생성기(crypto.getRandomValues)로 만들어집니다. 어떤 서버로도 전송되지 않고 기록되거나 저장되지도 않습니다.",
  },
  {
    question: "비밀번호는 몇 자가 적당한가요?",
    answer:
      "대부분의 계정에는 대문자, 소문자, 숫자, 기호를 섞어 최소 16자 이상을 쓰세요. 길수록 뚫기가 기하급수적으로 어려워지므로 서비스가 허용하는 최대 길이를 사용하시길 권합니다.",
  },
  {
    question: "'헷갈리는 문자 제외'는 어떤 기능인가요?",
    answer:
      "0, O, 1, l, I처럼 눈으로 구분하기 어려운 문자를 제외합니다. 보안을 의미 있게 낮추지 않으면서도 읽고 직접 입력하기 쉬워집니다.",
  },
  {
    question: "제 비밀번호가 서버로 전송되나요?",
    answer:
      "아니요. 모든 과정이 전적으로 브라우저에서 이뤄집니다. 비밀번호는 전송되거나 저장되거나 공유되지 않습니다. 탭을 닫으면 생성된 비밀번호는 완전히 사라집니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {

  const title = META_TITLE;
  const description = META_DESCRIPTION;

  return {
    title,
    description,
    alternates: buildAlternates(new URL(CANONICAL).pathname),
    openGraph: {
      title,
      description,
      url: CANONICAL,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

export default async function PasswordGeneratorPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.utility, item: "https://ssdown.app/tools/utility" },
      { "@type": "ListItem", position: 4, name: BREADCRUMB_TITLE, item: CANONICAL },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "비밀번호 생성기",
    url: CANONICAL,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "무료 온라인 비밀번호 생성기입니다. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "비밀번호 생성기 사용 방법",
    description: "브라우저에서 강력하고 무작위한 안전한 비밀번호를 만드세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose your options",
        text: "비밀번호 길이를 정하고 포함할 문자 종류를 고르세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Generate a password",
        text: "브라우저의 암호학적 난수를 이용해 안전한 비밀번호가 즉시 만들어집니다.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "복사해서 사용",
        text: "한 번의 클릭으로 비밀번호를 복사해 필요한 곳에 붙여넣으세요.",
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
      <PageShell
        sidebar={false}
        crumbs={[
          { label: dict.breadcrumb.tools, href: "/tools" },
          { label: dict.breadcrumb.utility, href: "/tools/utility" },
          { label: BREADCRUMB_TITLE },
        ]}
      >
        <PasswordGeneratorClient dict={dict} />
      </PageShell>
    </>
  );
}
