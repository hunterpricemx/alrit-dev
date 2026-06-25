import { db } from "@/lib/db";
import { safeQuery } from "./safe";

export type PostLocaleContent = { title: string; excerpt: string; body: string };

export type Post = {
  slug: string;
  category: string;
  cover: string | null;
  author: string;
  es: PostLocaleContent;
  en: PostLocaleContent;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  hasEn: boolean;
};

export type PostSitemapRow = { slug: string; updatedAt: string; publishedAt: string | null };

type PostRow = {
  slug: string;
  category: string;
  cover: string | null;
  author: string;
  locales: unknown;
  published: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
};

const EMPTY: PostLocaleContent = { title: "", excerpt: "", body: "" };

function mapRowToPost(row: PostRow): Post {
  const loc = (row.locales ?? {}) as { es?: Partial<PostLocaleContent>; en?: Partial<PostLocaleContent> };
  const es = { ...EMPTY, ...(loc.es ?? {}) };
  const en = { ...EMPTY, ...(loc.en ?? {}) };
  return {
    slug: row.slug,
    category: row.category,
    cover: row.cover,
    author: row.author,
    es,
    en,
    published: row.published,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
    hasEn: en.title.trim() !== "" && en.body.trim() !== "",
  };
}

const ORDER = { publishedAt: { sort: "desc", nulls: "last" } } as const;

export async function getPublishedPostsAsync(): Promise<Post[]> {
  return safeQuery(async () => {
    const rows = await db.post.findMany({ where: { published: true }, orderBy: ORDER });
    return rows.map(mapRowToPost);
  }, []);
}

export async function getLatestPostsAsync(n: number): Promise<Post[]> {
  return safeQuery(async () => {
    const rows = await db.post.findMany({ where: { published: true }, orderBy: ORDER, take: n });
    return rows.map(mapRowToPost);
  }, []);
}

export async function getPostBySlugAsync(slug: string): Promise<Post | undefined> {
  return safeQuery(async () => {
    const row = await db.post.findUnique({ where: { slug } });
    if (!row || !row.published) return undefined;
    return mapRowToPost(row);
  }, undefined);
}

export async function getAllPostSlugs(): Promise<PostSitemapRow[]> {
  return safeQuery(async () => {
    const rows = await db.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
    return rows.map((r) => ({
      slug: r.slug,
      updatedAt: r.updatedAt.toISOString(),
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    }));
  }, []);
}

export function postLocale(post: Post, locale: "es" | "en"): PostLocaleContent {
  const cur = post[locale];
  const pick = (k: keyof PostLocaleContent) => (cur[k].trim() !== "" ? cur[k] : post.es[k]);
  return { title: pick("title"), excerpt: pick("excerpt"), body: pick("body") };
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
