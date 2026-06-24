import Link from "next/link";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";

export const dynamic = "force-dynamic";

export default async function PortfolioListPage() {
  const projects = await safeQuery(
    () => db.project.findMany({ orderBy: { sortOrder: "asc" } }),
    [],
  );

  return (
    <>
      <header className="adm__head adm__head--row">
        <div>
          <h1 className="adm__title">Portafolio</h1>
          <p className="adm__subtitle">Edita los proyectos del portafolio del sitio.</p>
        </div>
        <Link href="/admin/portfolio/new" className="adm-btn">Nuevo proyecto</Link>
      </header>

      <div className="adm-panel">
        {projects.length === 0 ? (
          <p className="adm-row__hint">No hay proyectos. La DB podría estar vacía (se usa el contenido por defecto en el sitio).</p>
        ) : (
          <ul className="adm-list">
            {projects.map((p) => {
              const title = (p.locales as { es?: { title?: string } })?.es?.title ?? p.slug;
              return (
                <li className="adm-list__row" key={p.slug}>
                  <span className="adm-list__name">{title}</span>
                  <span className="adm-list__meta">
                    {p.cat} · {p.published ? "publicado" : "borrador"}
                  </span>
                  <Link href={`/admin/portfolio/${p.slug}`} className="adm-list__edit">Editar</Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
