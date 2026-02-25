import { ContactClient } from "@/components/client/contact-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/contact`;

  return {
    title: "Contact SSDown - Support & Help",
    description:
      "Contact SSDown support team for any questions, feedback or issues regarding our online tools and services.",
    openGraph: {
      title: "Contact SSDown",
      description:
        "Contact SSDown support team for any questions, feedback or issues regarding our online tools and services.",
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
  return <ContactClient />;
}
