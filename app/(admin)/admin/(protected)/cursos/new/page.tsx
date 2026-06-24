import CourseForm, { type CourseInitial } from "../_form";

export const dynamic = "force-dynamic";

const EMPTY: CourseInitial = {
  slug: "",
  language: "es",
  title: "",
  summary: "",
  description: "",
  coverImage: "",
  level: "intro",
  priceCents: 0,
  published: false,
  sortOrder: 0,
};

export default function NewCoursePage() {
  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Nuevo curso</h1>
        <p className="adm__subtitle">Crea el curso; luego podrás añadir secciones y lecciones.</p>
      </header>
      <CourseForm initial={EMPTY} isNew />
    </>
  );
}
