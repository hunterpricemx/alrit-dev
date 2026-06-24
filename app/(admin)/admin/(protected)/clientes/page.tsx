import Link from "next/link";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";

export const dynamic = "force-dynamic";

export default async function ClientsListPage() {
  const projects = await safeQuery(
    () =>
      db.clientProject.findMany({
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true, email: true } }, phases: { select: { done: true } } },
      }),
    [],
  );

  return (
    <>
      <header className="adm__head adm__head--row">
        <div>
          <h1 className="adm__title">Clientes</h1>
          <p className="adm__subtitle">Proyectos de clientes y su avance.</p>
        </div>
        <Link href="/admin/clientes/new" className="adm-btn">Nuevo cliente</Link>
      </header>

      <div className="adm-panel">
        {projects.length === 0 ? (
          <p className="adm-row__hint">Aún no hay proyectos de clientes.</p>
        ) : (
          <ul className="adm-list">
            {projects.map((p) => {
              const total = p.phases.length;
              const done = p.phases.filter((x) => x.done).length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <li className="adm-list__row" key={p.id}>
                  <span className="adm-list__name">{p.name}</span>
                  <span className="adm-list__meta">{p.client?.name ?? p.client?.email} · {pct}%</span>
                  <Link href={`/admin/clientes/${p.id}`} className="adm-list__edit">Gestionar</Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
