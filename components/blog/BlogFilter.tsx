"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BLOG_CATEGORIES, BLOG_CATEGORY_KEYS, categoryLabel } from "@/lib/content/blog-categories";

export type BlogCard = {
  slug: string;
  category: string;
  cover: string | null;
  title: string;
  excerpt: string;
  date: string;
  minutes: number;
};

export default function BlogFilter({
  cards,
  locale,
  t,
}: {
  cards: BlogCard[];
  locale: "es" | "en";
  t: { allCategories: string; minRead: string; emptyState: string; filterLabel: string };
}) {
  const sp = useSearchParams();
  const raw = sp.get("cat");
  const initial = raw && BLOG_CATEGORY_KEYS.includes(raw) ? raw : "all";
  const [cat, setCat] = useState(initial);
  const shown = cat === "all" ? cards : cards.filter((c) => c.category === cat);

  return (
    <>
      <div className="blog-filter" role="tablist" aria-label={t.filterLabel}>
        <button type="button" className="blog-filter__tab" aria-current={cat === "all"} onClick={() => setCat("all")}>
          {t.allCategories}
        </button>
        {BLOG_CATEGORIES.map((c) => (
          <button key={c.key} type="button" className="blog-filter__tab" aria-current={cat === c.key} onClick={() => setCat(c.key)}>
            {c[locale]}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="blog-empty">{t.emptyState}</p>
      ) : (
        <ul className="blog-grid">
          {shown.map((c) => (
            <li key={c.slug}>
              <Link href={`/${locale}/blog/${c.slug}`} className="blog-card">
                {c.cover && (
                  <span className="blog-card__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.cover} alt={c.title} loading="lazy" />
                  </span>
                )}
                <span className="blog-card__cat">{categoryLabel(c.category, locale)}</span>
                <span className="blog-card__title">{c.title}</span>
                <span className="blog-card__excerpt">{c.excerpt}</span>
                <span className="blog-card__meta">
                  {c.date && <span>{c.date}</span>}
                  <span>{c.minutes} {t.minRead}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
