import Link from "next/link";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { getDictionary } from "@/lib/i18n";
import { formatMXN } from "@/lib/pricing";

export const dynamic = "force-dynamic";

function fmt(d: Date): string {
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

const QUOTE_STATUS: Record<string, string> = { NEW: "Nuevo", CONTACTED: "Contactado", CLOSED: "Cerrado" };

export default async function AdminDashboard() {
  const [
    quotesNew, quotesTotal, recentQuotes,
    clientProjects, openIssues, recentIssues, recentComments,
    coursesPub, students, enrollments, portfolioCount,
  ] = await Promise.all([
    safeQuery(() => db.quote.count({ where: { status: "NEW" } }), 0),
    safeQuery(() => db.quote.count(), 0),
    safeQuery(() => db.quote.findMany({ orderBy: { createdAt: "desc" }, take: 5 }), []),
    safeQuery(() => db.clientProject.count(), 0),
    safeQuery(() => db.issue.count({ where: { status: { not: "RESOLVED" } } }), 0),
    safeQuery(() => db.issue.findMany({ where: { status: { not: "RESOLVED" } }, orderBy: { createdAt: "desc" }, take: 5, include: { project: { select: { id: true, name: true } } } }), []),
    safeQuery(() => db.projectComment.findMany({ where: { author: { role: "CLIENT" } }, orderBy: { createdAt: "desc" }, take: 5, include: { project: { select: { id: true, name: true } } } }), []),
    safeQuery(() => db.course.count({ where: { published: true } }), 0),
    safeQuery(() => db.user.count({ where: { role: "STUDENT" } }), 0),
    safeQuery(() => db.enrollment.count(), 0),
    safeQuery(() => db.project.count(), 0),
  ]);

  const t = getDictionary("es").calculator;
  const typeLabel = (id: string) => t.types[id as keyof typeof t.types]?.name ?? id;

  const stats = [
    { href: "/admin/cotizaciones", label: "Cotizaciones nuevas", value: quotesNew, sub: `${quotesTotal} en total`, accent: quotesNew > 0 },
    { href: "/admin/clientes", label: "Reportes abiertos", value: openIssues, sub: `${clientProjects} proyectos`, accent: openIssues > 0 },
    { href: "/admin/cursos", label: "Cursos publicados", value: coursesPub, sub: `${enrollments} inscripciones` },
    { href: "/admin/cursos", label: "Alumnos", value: students, sub: "registrados" },
    { href: "/admin/portfolio", label: "Portafolio", value: portfolioCount, sub: "proyectos" },
  ];

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Centro de operaciones</h1>
        <p className="adm__subtitle">Lo que necesita tu atención hoy.</p>
      </header>

      <div className="adm-grid">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`adm-card${s.accent ? " adm-card--accent" : ""}`}>
            <span className="adm-card__stat">{s.value}</span>
            <span className="adm-card__title" style={{ fontSize: "0.95rem" }}>{s.label}</span>
            <span className="adm-card__desc">{s.sub}</span>
          </Link>
        ))}
      </div>

      <div className="adm-dash-cols">
        {/* Cotizaciones recientes */}
        <div className="adm-panel">
          <p className="adm-section-title">Cotizaciones recientes</p>
          {recentQuotes.length === 0 ? (
            <p className="adm-row__hint">Sin cotizaciones todavía.</p>
          ) : (
            <ul className="adm-feed">
              {recentQuotes.map((q) => (
                <li className="adm-feed__item" key={q.id}>
                  <Link href="/admin/cotizaciones" className="adm-feed__link">
                    <div className="adm-feed__row">
                      <span className="adm-feed__name">{q.name} <span className={`adm-quote__badge adm-quote__badge--${q.status}`}>{QUOTE_STATUS[q.status]}</span></span>
                      <span className="adm-feed__meta">{fmt(q.createdAt)}</span>
                    </div>
                    <p className="adm-feed__sub">{typeLabel(q.projectType)} · {q.custom ? "A medida" : q.amount != null ? formatMXN(q.amount) : "—"}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actividad de clientes */}
        <div className="adm-panel">
          <p className="adm-section-title">Actividad de clientes</p>
          {recentIssues.length === 0 && recentComments.length === 0 ? (
            <p className="adm-row__hint">Sin actividad reciente.</p>
          ) : (
            <ul className="adm-feed">
              {recentIssues.map((it) => (
                <li className="adm-feed__item" key={`i-${it.id}`}>
                  <Link href={`/admin/clientes/${it.projectId}`} className="adm-feed__link">
                    <div className="adm-feed__row">
                      <span className="adm-feed__name">🐞 {it.title}</span>
                      <span className="adm-feed__meta">{fmt(it.createdAt)}</span>
                    </div>
                    <p className="adm-feed__sub">{it.project.name}</p>
                  </Link>
                </li>
              ))}
              {recentComments.map((c) => (
                <li className="adm-feed__item" key={`c-${c.id}`}>
                  <Link href={`/admin/clientes/${c.projectId}`} className="adm-feed__link">
                    <div className="adm-feed__row">
                      <span className="adm-feed__name">💬 {c.body.length > 60 ? c.body.slice(0, 60) + "…" : c.body}</span>
                      <span className="adm-feed__meta">{fmt(c.createdAt)}</span>
                    </div>
                    <p className="adm-feed__sub">{c.project.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
