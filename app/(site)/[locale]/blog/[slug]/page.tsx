import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale, locales } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { getPostBySlugAsync, getAllPostSlugs, getPublishedPostsAsync, postLocale, readingTime } from "@/lib/content/blog";
import { categoryLabel } from "@/lib/content/blog-categories";
import { BlogPostingJsonLd, BreadcrumbJsonLd } from "@/lib/seo/jsonld";
import Markdown from "@/components/blog/Markdown";

export const revalidate = 3600;
const SITE_URL = "https://alrit.dev";

export async function generateStaticParams() {
  const rows = await getAllPostSlugs();
  return locales.flatMap((locale) => rows.map((r) => ({ locale, slug: r.slug })));
}

function plain(md: string): string {
  return md.replace(/[#>*_`~\-]/g, " ").replace(/\s+/g, " ").trim();
}

function absCover(cover: string | null): string | undefined {
  if (!cover) return undefined;
  return cover.startsWith("http") ? cover : `${SITE_URL}${cover}`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = isLocale(locale) ? locale : "es";
  const post = await getPostBySlugAsync(slug);
  if (!post) return {};
  const c = postLocale(post, l);
  const description = (c.excerpt || plain(c.body)).slice(0, 155);
  const languages: Record<string, string> = { es: `/es/blog/${slug}`, "x-default": `/es/blog/${slug}` };
  if (post.hasEn) languages.en = `/en/blog/${slug}`;
  const cover = absCover(post.cover);
  return {
    title: `${c.title} | Alrit.dev`,
    description,
    alternates: { canonical: `/${l}/blog/${slug}`, languages },
    openGraph: {
      title: c.title,
      description,
      type: "article",
      url: `${SITE_URL}/${l}/blog/${slug}`,
      locale: l === "en" ? "en_US" : "es_MX",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      images: cover ? [cover] : undefined,
    },
    twitter: { card: "summary_large_image", title: c.title, description },
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

export default async function PostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const post = await getPostBySlugAsync(slug);
  if (!post) notFound();

  const [dict, all] = await Promise.all([getDictionaryAsync(l), getPublishedPostsAsync()]);
  const c = postLocale(post, l);
  const related = all.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3);
  const cover = absCover(post.cover);
  const base = `/${l}`;

  return (
    <>
      <BlogPostingJsonLd
        url={`${SITE_URL}${base}/blog/${slug}`}
        headline={c.title.slice(0, 110)}
        description={(c.excerpt || c.title).slice(0, 155)}
        image={cover}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt}
        author={post.author}
        locale={l}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}${base}` },
          { name: dict.blog.eyebrow, url: `${SITE_URL}${base}/blog` },
          { name: c.title, url: `${SITE_URL}${base}/blog/${slug}` },
        ]}
      />

      <article className="article">
        <Link href={`${base}/blog`} className="article__cat" style={{ textDecoration: "none" }}>← {dict.blog.backToBlog}</Link>
        <p className="article__cat">{categoryLabel(post.category, l)}</p>
        <h1 className="article__title">{c.title}</h1>
        <div className="article__meta">
          <span>{dict.blog.authorBy} {post.author}</span>
          {post.publishedAt && <span>· {fmtDate(post.publishedAt, l)}</span>}
          <span>· {readingTime(c.body)} {dict.blog.minRead}</span>
        </div>
        {cover && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className="article__cover" src={cover} alt={c.title} />
        )}
        <Markdown source={c.body} />
      </article>

      {related.length > 0 && (
        <section className="blog-hub" style={{ paddingTop: 0 }}>
          <h2 className="blog-hub__title" style={{ fontSize: "1.6rem" }}>{dict.blog.relatedTitle}</h2>
          <ul className="blog-grid" style={{ padding: "1.5rem 1.5rem 4rem" }}>
            {related.map((p) => {
              const rc = postLocale(p, l);
              return (
                <li key={p.slug}>
                  <Link href={`${base}/blog/${p.slug}`} className="blog-card">
                    {p.cover && (
                      <span className="blog-card__media">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.cover} alt={rc.title} loading="lazy" />
                      </span>
                    )}
                    <span className="blog-card__cat">{categoryLabel(p.category, l)}</span>
                    <span className="blog-card__title">{rc.title}</span>
                    <span className="blog-card__excerpt">{rc.excerpt}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
