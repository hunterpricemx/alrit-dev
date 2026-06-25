import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale, locales } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getPublishedPostsAsync, postLocale, readingTime } from "@/lib/content/blog";
import BlogFilter, { type BlogCard } from "@/components/blog/BlogFilter";
import { FEATURES } from "@/lib/features";

export const revalidate = 3600;
const SITE_URL = "https://alrit.dev";

export function generateStaticParams() {
  if (!FEATURES.blog) return [];
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "es";
  const dict = await getDictionaryAsync(l);
  return {
    title: `${dict.blog.eyebrow} | Alrit.dev`,
    description: dict.blog.text,
    alternates: {
      canonical: `/${l}/blog`,
      languages: { es: "/es/blog", en: "/en/blog", "x-default": "/es/blog" },
    },
    openGraph: {
      title: `${dict.blog.eyebrow} | Alrit.dev`,
      description: dict.blog.text,
      url: `${SITE_URL}/${l}/blog`,
      type: "website",
    },
  };
}

function fmtDate(iso: string | null, l: Locale): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(l === "en" ? "en-US" : "es-MX", {
    timeZone: "UTC",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!FEATURES.blog) notFound();
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const [dict, posts] = await Promise.all([getDictionaryAsync(l), getPublishedPostsAsync()]);

  const cards: BlogCard[] = posts.map((p) => {
    const c = postLocale(p, l);
    return {
      slug: p.slug,
      category: p.category,
      cover: p.cover,
      title: c.title,
      excerpt: c.excerpt,
      date: fmtDate(p.publishedAt, l),
      minutes: readingTime(c.body),
    };
  });

  return (
    <>
      <header className="blog-hub">
        <p className="blog-hub__eyebrow">{dict.blog.eyebrow}</p>
        <h1 className="blog-hub__title">{dict.blog.title}</h1>
        <p className="blog-hub__sub">{dict.blog.text}</p>
      </header>
      <Suspense fallback={<div className="blog-grid" />}>
        <BlogFilter
          cards={cards}
          locale={l}
          t={{
            allCategories: dict.blog.allCategories,
            minRead: dict.blog.minRead,
            emptyState: dict.blog.emptyState,
            filterLabel: dict.blog.filterLabel,
          }}
        />
      </Suspense>
    </>
  );
}
