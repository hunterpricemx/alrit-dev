"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { BLOG_CATEGORY_KEYS } from "@/lib/content/blog-categories";

export type PostFormState = { ok: boolean; error?: string; id?: string };

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

const schema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug inválido (minúsculas, números y guiones)"),
  category: z.string().refine((k) => BLOG_CATEGORY_KEYS.includes(k), "categoría inválida"),
  cover: z.string(),
  author: z.string().min(1).max(120),
  es_title: z.string().max(110),
  es_excerpt: z.string().max(180),
  es_body: z.string(),
  en_title: z.string().max(110),
  en_excerpt: z.string().max(180),
  en_body: z.string(),
});

function revalidateSite() {
  revalidatePath("/[locale]", "layout");
}

export async function savePost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  await requireAdmin();

  const fields = {
    slug: str(formData.get("slug")),
    category: str(formData.get("category")),
    cover: str(formData.get("cover")),
    author: str(formData.get("author")) || "Equipo Alrit",
    es_title: str(formData.get("es_title")),
    es_excerpt: str(formData.get("es_excerpt")),
    es_body: str(formData.get("es_body")),
    en_title: str(formData.get("en_title")),
    en_excerpt: str(formData.get("en_excerpt")),
    en_body: str(formData.get("en_body")),
  };

  const parsed = schema.safeParse(fields);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const id = str(formData.get("id"));
  const published = formData.get("published") === "on";
  const dateInput = str(formData.get("publishedAt"));
  let publishedAt: Date | null = dateInput ? new Date(`${dateInput}T12:00:00Z`) : null;
  if (published && !publishedAt) {
    publishedAt = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00Z`);
  }

  const data = {
    slug: parsed.data.slug,
    category: parsed.data.category,
    cover: parsed.data.cover || null,
    author: parsed.data.author,
    locales: {
      es: { title: parsed.data.es_title, excerpt: parsed.data.es_excerpt, body: parsed.data.es_body },
      en: { title: parsed.data.en_title, excerpt: parsed.data.en_excerpt, body: parsed.data.en_body },
    },
    published,
    publishedAt,
  };

  try {
    const saved = id
      ? await db.post.update({ where: { id }, data })
      : await db.post.create({ data });
    revalidateSite();
    return { ok: true, id: saved.id };
  } catch {
    return { ok: false, error: "No se pudo guardar (¿slug duplicado?)." };
  }
}

export async function deletePost(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await db.post.delete({ where: { id } });
  revalidateSite();
  return { ok: true };
}

export async function togglePublished(id: string, published: boolean) {
  await requireAdmin();
  await db.post.update({ where: { id }, data: { published } });
  revalidateSite();
}
