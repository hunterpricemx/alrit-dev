import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionaryAsync } from "@/lib/i18n";
import { auth } from "@/auth";
import { getClientProjectAsync, progressPct } from "@/lib/content/portal";
import CommentForm from "@/components/portal/CommentForm";
import IssueForm from "@/components/portal/IssueForm";

export const dynamic = "force-dynamic";

function fmt(d: Date, l: string): string {
  return d.toLocaleDateString(l === "en" ? "en-US" : "es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function PortalDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect(`/${l}/ingresar`);

  const project = await getClientProjectAsync(userId, id);
  if (!project) notFound();

  const t = (await getDictionaryAsync(l)).portal;
  const pct = progressPct(project.phases);

  return (
    <section className="portal portal-detail">
      <Link href={`/${l}/portal`} className="portal-detail__back">← {t.back}</Link>
      <h1 className="portal-detail__title">{project.name}</h1>
      {project.summary && <p className="portal-detail__summary">{project.summary}</p>}

      {/* Avance */}
      <div className="portal-block">
        <p className="portal-block__title">{t.progress} — {pct}%</p>
        <div className="portal-prog"><span style={{ width: `${pct}%` }} /></div>
        <ul className="portal-phases" style={{ marginTop: "1rem" }}>
          {project.phases.map((ph) => (
            <li key={ph.id} className={`portal-phase${ph.done ? " is-done" : ""}`}>
              <span className="portal-phase__check">✓</span>
              <span className="portal-phase__title">{ph.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actualizaciones */}
      <div className="portal-block">
        <p className="portal-block__title">{t.updates}</p>
        {project.updates.length === 0 ? (
          <p className="adm-row__hint">{t.noUpdates}</p>
        ) : (
          <ul className="portal-updates">
            {project.updates.map((u) => (
              <li className="portal-update" key={u.id}>
                <span className="portal-update__date">{fmt(u.createdAt, l)}</span>
                <p className="portal-update__body">{u.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bugs / ajustes */}
      <div className="portal-block">
        <p className="portal-block__title">{t.issues}</p>
        {project.issues.length > 0 && (
          <ul className="portal-issues">
            {project.issues.map((it) => (
              <li className="portal-issue" key={it.id}>
                <div className="portal-issue__body">
                  <span className="portal-issue__title">{it.title}</span>
                  {it.description && <p className="portal-issue__desc">{it.description}</p>}
                </div>
                <div className="portal-issue__meta">
                  <span className={`portal-badge portal-badge--${it.priority}`}>{t.priorityLabels[it.priority]}</span>
                  <span className={`portal-badge portal-badge--${it.status}`}>{t.statusLabels[it.status]}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <IssueForm
          projectId={project.id}
          locale={l}
          labels={{ newIssue: t.newIssue, issueTitle: t.issueTitle, issueDesc: t.issueDesc, create: t.create, priority: t.priority, priorityLabels: t.priorityLabels }}
        />
      </div>

      {/* Comentarios */}
      <div className="portal-block">
        <p className="portal-block__title">{t.comments}</p>
        {project.comments.length > 0 ? (
          <ul className="portal-comments">
            {project.comments.map((c) => (
              <li className="portal-comment" key={c.id}>
                <span className="portal-comment__meta">{c.author.role === "CLIENT" ? t.you : t.team} · {fmt(c.createdAt, l)}</span>
                <p className="portal-comment__body">{c.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-row__hint">{t.noComments}</p>
        )}
        <CommentForm projectId={project.id} locale={l} placeholder={t.commentPlaceholder} send={t.send} />
      </div>
    </section>
  );
}
