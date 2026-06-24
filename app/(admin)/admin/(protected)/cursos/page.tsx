import Link from "next/link";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";

export const dynamic = "force-dynamic";

export default async function CoursesListPage() {
  const courses = await safeQuery(() => db.course.findMany({ orderBy: { sortOrder: "asc" } }), []);

  return (
    <>
      <header className="adm__head adm__head--row">
        <div>
          <h1 className="adm__title">Cursos</h1>
          <p className="adm__subtitle">Crea y gestiona los cursos del LMS.</p>
        </div>
        <Link href="/admin/cursos/new" className="adm-btn">Nuevo curso</Link>
      </header>

      <div className="adm-panel">
        {courses.length === 0 ? (
          <p className="adm-row__hint">Aún no hay cursos.</p>
        ) : (
          <ul className="adm-list">
            {courses.map((c) => (
              <li className="adm-list__row" key={c.id}>
                <span className="adm-list__name">{c.title}</span>
                <span className="adm-list__meta">{c.language} · {c.published ? "publicado" : "borrador"}</span>
                <Link href={`/admin/cursos/${c.id}`} className="adm-list__edit">Editar</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
