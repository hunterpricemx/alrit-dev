import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getAllServiceSlugs } from "@/lib/content/services";
import { getAllProjectSlugs } from "@/lib/content/portfolio";

const SITE_URL = "https://alrit.dev";
const LAST = new Date("2026-06-22");

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap {
  // path without locale prefix, e.g. "" for home or "/servicios/x"
  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: LAST,
    changeFrequency,
    priority: locale === "es" ? priority : priority - 0.05,
    alternates: {
      languages: {
        es: `${SITE_URL}/es${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const services = getAllServiceSlugs();
  const projects = getAllProjectSlugs();

  return [
    ...entry("", "weekly", 1),
    ...entry("/servicios", "weekly", 0.9),
    ...services.flatMap((s) => entry(`/servicios/${s}`, "monthly", 0.8)),
    ...entry("/portafolio", "weekly", 0.7),
    ...projects.flatMap((p) => entry(`/portafolio/${p}`, "monthly", 0.6)),
  ];
}
