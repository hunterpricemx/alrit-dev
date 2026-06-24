import Link from "next/link";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";

export default async function AdminDashboard() {
  const projects = await safeQuery(() => db.project.count(), 0);
  const overrides = await safeQuery(() => db.textOverride.count(), 0);
  const media = await safeQuery(() => db.media.count(), 0);

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Panel</h1>
        <p className="adm__subtitle">Administra el contenido de alrit.dev.</p>
      </header>

      <div className="adm-grid">
        <Link href="/admin/pricing" className="adm-card">
          <span className="adm-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </span>
          <h2 className="adm-card__title">Precios</h2>
          <p className="adm-card__desc">Edita los precios y tiempos de la calculadora.</p>
        </Link>

        <div className="adm-card">
          <span className="adm-card__stat">{projects}</span>
          <p className="adm-card__desc">Proyectos en portafolio</p>
        </div>
        <div className="adm-card">
          <span className="adm-card__stat">{media}</span>
          <p className="adm-card__desc">Archivos en biblioteca</p>
        </div>
        <div className="adm-card">
          <span className="adm-card__stat">{overrides}</span>
          <p className="adm-card__desc">Textos personalizados</p>
        </div>
      </div>
    </>
  );
}
