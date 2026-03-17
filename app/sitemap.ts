// Sitemap index → app/sitemap.xml/route.ts (/sitemap.xml)
// Static pages  → app/sitemap-static.xml/route.ts (/sitemap-static.xml)
// Software apps → app/sitemap-software.xml/route.ts (/sitemap-software.xml)
import { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
