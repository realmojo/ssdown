import { type Locale } from "@/lib/i18n-config";
export const runtime = "edge";
import { getDictionary } from "@/lib/get-dictionary";
import { ContactClient } from "@/components/client/contact-client";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}contact`;

  return {
    title: dict.contact?.seo_title || "Contact SSDown - Support & Help",
    description:
      dict.contact?.seo_description ||
      "Contact SSDown support team for any questions, feedback or issues regarding our video downloader service.",
    openGraph: {
      title: dict.contact?.seo_title || "Contact SSDown",
      description: dict.contact?.seo_description,
      url: canonical,
      siteName: "SSDown",
      locale:
        lang === "en"
          ? "en_US"
          : lang === "jp"
          ? "ja_JP"
          : lang === "kr"
          ? "ko_KR"
          : lang === "pt"
          ? "pt_BR"
          : "fr_FR",
      type: "website",
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function ContactPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return <ContactClient dict={dict} />;
}
