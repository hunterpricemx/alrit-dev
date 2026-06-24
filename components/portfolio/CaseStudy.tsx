import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Project } from "@/lib/content/portfolio";
import DeviceFrame from "@/components/ui/DeviceFrame";
import Reveal from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";

const ROCKET_ICON =
  "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.7-.84.69-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0 M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12l4 4 10-10" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

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
  const accent = SERVICES.find((s) => s.id === project.relatedService)?.accent ?? "#8a6bff";

  // Accent the last word of the CTA title.
  const ctaParts = c.ctaTitle.trim().split(" ");
  const ctaLast = ctaParts.pop() ?? "";

  return (
    <article className="case" style={{ "--accent": accent } as React.CSSProperties}>
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

      <div className="case__devices" style={{ "--bg": project.bg } as React.CSSProperties}>
        <DeviceFrame desktop={project.image} mobile={project.imageMobile} alt={p.title} />
      </div>

      <Reveal as="section" className="case-card">
        <div className="case-card__main">
          <span className="case-card__bar" aria-hidden="true" />
          <h2 className="case-card__h">{c.challenge}</h2>
          <p className="case-card__p">{p.long}</p>

          {project.highlights.length > 0 && (
            <>
              <h3 className="case-card__sub">{c.highlights}</h3>
              <ul className="case-feats">
                {project.highlights.map((h, i) => (
                  <li key={i}>
                    <span className="case-feats__check" aria-hidden="true"><Check /></span>
                    {h}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="case-facts">
          <dl className="case-facts__list">
            <div className="case-facts__row">
              <dt>{c.industry}</dt>
              <dd>{project.industry}</dd>
            </div>
            {project.tech && (
              <div className="case-facts__row">
                <dt>{c.tech}</dt>
                <dd>{project.tech}</dd>
              </div>
            )}
            <div className="case-facts__row">
              <dt>{c.relatedService}</dt>
              <dd>
                <Link href={`${base}/servicios/${project.relatedService}`} className="case__svc-link">
                  {relatedServiceTitle}
                </Link>
              </dd>
            </div>
          </dl>

          {project.tags.length > 0 && (
            <div className="case-facts__tags">
              {project.tags.map((t) => (
                <span key={t} className="case__tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </aside>
      </Reveal>

      <section className="case__cta">
        <Reveal className="svc-cta2">
          <span className="svc-cta2__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d={ROCKET_ICON} />
            </svg>
          </span>
          <div className="svc-cta2__copy">
            <h2 className="svc-cta2__title">
              {ctaParts.join(" ")} <span className="svc-cta2__accent">{ctaLast}</span>
            </h2>
            <p className="svc-cta2__text">{c.ctaText}</p>
          </div>
          <div className="svc-cta2__actions">
            <Link href={`${base}#calculator`} className="svc-cta2__btn svc-cta2__btn--primary">
              {c.ctaPrimary} <Arrow />
            </Link>
            <Link href={`${base}/portafolio`} className="svc-cta2__btn svc-cta2__btn--ghost">
              {c.backToPortfolio}
            </Link>
          </div>
        </Reveal>
      </section>
    </article>
  );
}
