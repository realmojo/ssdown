import { Metadata } from "next";
import { Suspense } from "react";
import { searchApps } from "@/lib/app-utils";
import SearchClient from "@/components/client/search-client";

const SITE_URL = "https://ssdown.app";
const SITE_NAME = "SSDown";
const PAGE_SIZE = 24;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const parts: string[] = [];
  if (params.os) parts.push(params.os.charAt(0).toUpperCase() + params.os.slice(1));
  if (params.license) parts.push(params.license);
  if (params.category) parts.push(params.category);
  if (params.q) parts.push(`"${params.q}"`);

  const title = parts.length
    ? `${parts.join(" ")} Software Download - ${SITE_NAME}`
    : `Software Search & Filter - ${SITE_NAME}`;
  const description = `Search and filter ${parts.length ? parts.join(", ") + " " : ""}software apps. Find the best apps by platform, license type, and category.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/search` },
    openGraph: { title, description, url: `${SITE_URL}/search`, siteName: SITE_NAME, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const os = params.os ?? "";
  const license = params.license ?? "";
  const category = params.category ?? "";
  const q = params.q ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { apps, total } = await searchApps({ os, license, category, q, limit: PAGE_SIZE, offset });

  return (
    <Suspense>
      <SearchClient
        initialApps={apps}
        initialTotal={total}
        initialOs={os}
        initialLicense={license}
        initialCategory={category}
        initialQ={q}
        initialPage={page}
      />
    </Suspense>
  );
}
