"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

const guard = requireAdmin;

function revalidateSite() {
  revalidatePath("/[locale]", "layout");
}

export type ProjectFormState = { ok: boolean; error?: string; slug?: string };

const lines = (v: FormDataEntryValue | null) =>
  (typeof v === "string" ? v : "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

const schema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug inválido (minúsculas, números y guiones)"),
  image: z.string().min(1),
  imageMobile: z.string().min(1),
  bg: z.string().min(1),
  cat: z.string().min(1),
  relatedService: z.string().min(1),
  url: z.string(),
  status: z.string().min(1),
  industry: z.string(),
  tech: z.string(),
});

export async function saveProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await guard();

  const fields = {
    slug: str(formData.get("slug")),
    image: str(formData.get("image")),
    imageMobile: str(formData.get("imageMobile")),
    bg: str(formData.get("bg")),
    cat: str(formData.get("cat")),
    relatedService: str(formData.get("relatedService")),
    url: str(formData.get("url")),
    status: str(formData.get("status")),
    industry: str(formData.get("industry")),
    tech: str(formData.get("tech")),
  };

  const parsed = schema.safeParse(fields);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const locales = {
    es: { title: str(formData.get("es_title")), short: str(formData.get("es_short")), long: str(formData.get("es_long")) },
    en: { title: str(formData.get("en_title")), short: str(formData.get("en_short")), long: str(formData.get("en_long")) },
  };
  const highlights = lines(formData.get("highlights"));
  const tags = lines(formData.get("tags"));
  const published = formData.get("published") === "on";
  const sortOrder = Number(str(formData.get("sortOrder"))) || 0;

  const data = { ...parsed.data, locales, highlights, tags, published, sortOrder };

  try {
    await db.project.upsert({
      where: { slug: data.slug },
      create: data,
      update: data,
    });
  } catch {
    return { ok: false, error: "No se pudo guardar en la base de datos." };
  }

  revalidateSite();
  return { ok: true, slug: data.slug };
}

export async function togglePublished(slug: string, published: boolean) {
  await guard();
  await db.project.update({ where: { slug }, data: { published } });
  revalidateSite();
}

export async function deleteProject(slug: string): Promise<{ ok: boolean }> {
  await guard();
  await db.project.delete({ where: { slug } });
  revalidateSite();
  return { ok: true };
}
