import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { deleteCourse } from "../../../_actions/courses";
import CourseForm, { type CourseInitial } from "../_form";
import SectionsManager from "../_sections";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await safeQuery(
    () =>
      db.course.findUnique({
        where: { id },
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: { lessons: { orderBy: { sortOrder: "asc" } } },
          },
        },
      }),
    null,
  );
  if (!course) notFound();

  const initial: CourseInitial = {
    id: course.id,
    slug: course.slug,
    language: course.language,
    title: course.title,
    summary: course.summary,
    description: course.description,
    coverImage: course.coverImage ?? "",
    level: course.level,
    priceCents: course.priceCents,
    published: course.published,
    sortOrder: course.sortOrder,
  };
  const sections = course.sections.map((s) => ({
    id: s.id,
    title: s.title,
    lessons: s.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      videoUrl: l.videoUrl,
      content: l.content,
      durationMin: l.durationMin,
      preview: l.preview,
    })),
  }));

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Editar curso</h1>
        <p className="adm__subtitle">{course.slug}</p>
      </header>

      <CourseForm initial={initial} isNew={false} />
      <SectionsManager courseId={course.id} sections={sections} />

      <form
        className="adm-danger"
        action={async () => {
          "use server";
          await deleteCourse(id);
          redirect("/admin/cursos");
        }}
      >
        <button type="submit" className="adm-danger__btn">Eliminar curso</button>
      </form>
    </>
  );
}
