export type BlogCategory = { key: string; es: string; en: string };

export const BLOG_CATEGORIES: BlogCategory[] = [
  { key: "desarrollo-web", es: "Desarrollo web", en: "Web development" },
  { key: "seo", es: "SEO y posicionamiento", en: "SEO" },
  { key: "ecommerce", es: "E-commerce", en: "E-commerce" },
  { key: "negocio", es: "Negocio digital", en: "Digital business" },
];

export const BLOG_CATEGORY_KEYS = BLOG_CATEGORIES.map((c) => c.key);

export function categoryLabel(key: string, locale: "es" | "en"): string {
  const c = BLOG_CATEGORIES.find((x) => x.key === key);
  return c ? c[locale] : key;
}
