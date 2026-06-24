"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";

function userIdOf(session: unknown): string | undefined {
  return (session as { user?: { id?: string } } | null | undefined)?.user?.id;
}

export type EnrollResult = { ok: boolean; needLogin?: boolean; firstLessonId?: string };

export async function enroll(courseSlug: string, locale: string): Promise<EnrollResult> {
  const userId = userIdOf(await auth());
  if (!userId) return { ok: false, needLogin: true };

  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    include: { sections: { orderBy: { sortOrder: "asc" }, include: { lessons: { orderBy: { sortOrder: "asc" } } } } },
  });
  if (!course || !course.published) return { ok: false };

  await db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    create: { userId, courseId: course.id },
    update: {},
  });

  revalidatePath(`/${locale}/mi-aprendizaje`);
  const firstLessonId = course.sections.flatMap((s) => s.lessons)[0]?.id;
  return { ok: true, firstLessonId };
}

export async function markLessonComplete(
  lessonId: string,
  completed: boolean,
  locale: string,
): Promise<{ ok: boolean }> {
  const userId = userIdOf(await auth());
  if (!userId) return { ok: false };

  if (completed) {
    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId },
      update: {},
    });
  } else {
    await db.lessonProgress.deleteMany({ where: { userId, lessonId } });
  }
  revalidatePath(`/${locale}/mi-aprendizaje`);
  return { ok: true };
}
