import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";

const SITE_URL = "https://alrit.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: new Date("2026-06-22"),
    changeFrequency: "weekly",
    priority: locale === "es" ? 1 : 0.9,
    alternates: {
      languages: {
        es: `${SITE_URL}/es`,
        en: `${SITE_URL}/en`,
      },
    },
  }));
}
