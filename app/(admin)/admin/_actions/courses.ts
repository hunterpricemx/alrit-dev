"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

function revalidatePublic() {
  revalidatePath("/[locale]/cursos", "page");
  revalidatePath("/[locale]/cursos/[slug]", "page");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => Math.max(0, Math.round(Number(fd.get(k)) || 0));
const slugRe = /^[a-z0-9-]+$/;

export type CourseState = { ok: boolean; error?: string; id?: string };

// ---------- Curso ----------
const courseSchema = z.object({
  slug: z.string().regex(slugRe, "Slug inválido (minúsculas, números, guiones)"),
  title: z.string().min(1, "Falta el título"),
});

export async function saveCourse(_prev: CourseState, fd: FormData): Promise<CourseState> {
  await requireAdmin();
  const id = str(fd, "id");
  const data = {
    slug: str(fd, "slug"),
    language: str(fd, "language") || "es",
    title: str(fd, "title"),
    summary: str(fd, "summary"),
    description: str(fd, "description"),
    coverImage: str(fd, "coverImage") || null,
    level: str(fd, "level") || "intro",
    priceCents: num(fd, "priceCents"),
    published: fd.get("published") === "on",
    sortOrder: num(fd, "sortOrder"),
  };
  const parsed = courseSchema.safeParse({ slug: data.slug, title: data.title });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  try {
    if (id) {
      await db.course.update({ where: { id }, data });
      revalidatePublic();
      return { ok: true, id };
    }
    const created = await db.course.create({ data });
    revalidatePublic();
    return { ok: true, id: created.id };
  } catch {
    return { ok: false, error: "No se pudo guardar (¿slug duplicado?)." };
  }
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  await db.course.delete({ where: { id } });
  revalidatePublic();
}

// ---------- Secciones ----------
export async function addSection(courseId: string, title: string) {
  await requireAdmin();
  const sortOrder = await db.section.count({ where: { courseId } });
  await db.section.create({ data: { courseId, title: title.trim() || "Sección", sortOrder } });
  revalidatePublic();
}
export async function updateSection(id: string, title: string) {
  await requireAdmin();
  await db.section.update({ where: { id }, data: { title: title.trim() || "Sección" } });
  revalidatePublic();
}
export async function deleteSection(id: string) {
  await requireAdmin();
  await db.section.delete({ where: { id } });
  revalidatePublic();
}

// ---------- Lecciones ----------
export async function saveLesson(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const id = str(fd, "id");
  const sectionId = str(fd, "sectionId");
  const title = str(fd, "title");
  if (!title) return { ok: false, error: "Falta el título de la lección." };
  const data = {
    title,
    videoUrl: str(fd, "videoUrl") || null,
    content: str(fd, "content") || null,
    durationMin: Number(fd.get("durationMin")) || null,
    preview: fd.get("preview") === "on",
  };
  if (id) {
    await db.lesson.update({ where: { id }, data });
  } else {
    if (!sectionId) return { ok: false, error: "Sección inválida." };
    const sortOrder = await db.lesson.count({ where: { sectionId } });
    await db.lesson.create({ data: { ...data, sectionId, sortOrder } });
  }
  revalidatePublic();
  return { ok: true };
}
export async function deleteLesson(id: string) {
  await requireAdmin();
  await db.lesson.delete({ where: { id } });
  revalidatePublic();
}
