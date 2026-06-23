import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Project } from "@/lib/content/portfolio";

export default function CaseStudy({
  locale,
  dict,
  project,
  categoryLabel,
  relatedServiceTitle,
}: {
  locale: Locale;
  dict: Dictionary;
  project: Project;
  categoryLabel: string;
  relatedServiceTitle: string;
}) {
  const c = dict.caseStudy;
  const base = `/${locale}`;
  const p = project[locale];

  return (
    <article className="case">
      <nav className="case__crumbs" aria-label="Breadcrumb">
        <Link href={base}>{c.home}</Link>
        <span aria-hidden="true">/</span>
        <Link href={`${base}/portafolio`}>{c.portfolio}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.title}</span>
      </nav>

      <header className="case__hero">
        <p className="case__cat">{categoryLabel}</p>
        <h1 className="case__title">{p.title}</h1>
        <p className="case__lede">{p.short}</p>
        <div className="case__actions">
          {project.status === "live" && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="case__btn case__btn--primary"
            >
              {c.visit}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          )}
          <Link href={`${base}#calculator`} className="case__btn case__btn--ghost">
            {c.ctaPrimary}
          </Link>
        </div>
      </header>

      <div className="case__shot" style={{ "--bg": project.bg } as React.CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.image} alt={p.title} />
      </div>

      <div className="case__body">
        <div className="case__main">
          <h2 className="case__h2">{c.challenge}</h2>
          <p className="case__p">{p.long}</p>

          {project.highlights.length > 0 && (
            <>
              <h2 className="case__h2">{c.highlights}</h2>
              <ul className="case__list">
                {project.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="case__side">
          <dl className="case__meta">
            <dt>{c.industry}</dt>
            <dd>{project.industry}</dd>
            {project.tech && (
              <>
                <dt>{c.tech}</dt>
                <dd>{project.tech}</dd>
              </>
            )}
            <dt>{c.relatedService}</dt>
            <dd>
              <Link href={`${base}/servicios/${project.relatedService}`} className="case__svc-link">
                {relatedServiceTitle}
              </Link>
            </dd>
          </dl>

          {project.tags.length > 0 && (
            <div className="case__tags">
              {project.tags.map((t) => (
                <span key={t} className="case__tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </aside>
      </div>

      <section className="case__cta">
        <div className="case__cta-panel">
          <h2 className="case__cta-title">{c.ctaTitle}</h2>
          <p className="case__cta-text">{c.ctaText}</p>
          <div className="case__cta-actions">
            <Link href={`${base}#calculator`} className="case__btn case__btn--light">
              {c.ctaPrimary}
            </Link>
            <Link href={`${base}/portafolio`} className="case__btn case__btn--outline">
              {c.backToPortfolio}
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
