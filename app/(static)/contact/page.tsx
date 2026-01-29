import { getDictionary } from "@/lib/get-dictionary";
import { ContactClient } from "@/components/client/contact-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/contact`;

  return {
    title: "Contact SSDown - Support & Help",
    description:
      "Contact SSDown support team for any questions, feedback or issues regarding our video downloader service.",
    openGraph: {
      title: "Contact SSDown",
      description:
        "Contact SSDown support team for any questions, feedback or issues regarding our video downloader service.",
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function ContactPage() {
  const dict = await getDictionary();

  return <ContactClient dict={dict} />;
}
