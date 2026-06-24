import { db } from "@/lib/db";
import { safeQuery } from "./safe";

export type CourseCardData = {
  slug: string;
  title: string;
  summary: string;
  coverImage: string | null;
  level: string;
  language: string;
  priceCents: number;
  lessonCount: number;
};

export async function getPublishedCoursesAsync(): Promise<CourseCardData[]> {
  return safeQuery(async () => {
    const rows = await db.course.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: { sections: { include: { _count: { select: { lessons: true } } } } },
    });
    return rows.map((c) => ({
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      coverImage: c.coverImage,
      level: c.level,
      language: c.language,
      priceCents: c.priceCents,
      lessonCount: c.sections.reduce((n, s) => n + s._count.lessons, 0),
    }));
  }, []);
}

/** Curso publicado con secciones + lecciones (o null si no existe / no publicado). */
export async function getCourseBySlugAsync(slug: string) {
  return safeQuery(async () => {
    const c = await db.course.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
          include: { lessons: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    if (!c || !c.published) return null;
    return c;
  }, null);
}

/** Convierte una URL de YouTube/Vimeo en su URL de embed. */
export function toEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export async function getAllCourseSlugs(): Promise<string[]> {
  return safeQuery(
    async () => (await db.course.findMany({ where: { published: true }, select: { slug: true } })).map((c) => c.slug),
    [],
  );
}
