import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { ServiceLocaleContent } from "@/lib/content/services";
import type { Project } from "@/lib/content/portfolio";
import FaqAccordion from "./FaqAccordion";

export default function ServiceLanding({
  locale,
  dict,
  content,
  accent,
  serviceTitle,
  keywords,
  related,
}: {
  locale: Locale;
  dict: Dictionary;
  content: ServiceLocaleContent;
  accent: string;
  serviceTitle: string;
  keywords: string[];
  related: Project[];
}) {
  const l = dict.serviceLanding;
  const base = `/${locale}`;

  return (
    <article className="svc" style={{ "--accent": accent } as React.CSSProperties}>
      {/* Breadcrumb */}
      <nav className="svc__crumbs" aria-label="Breadcrumb">
        <Link href={base}>{l.home}</Link>
        <span aria-hidden="true">/</span>
        <Link href={`${base}/servicios`}>{l.services}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{serviceTitle}</span>
      </nav>

      {/* Hero */}
      <header className="svc__hero">
        <div className="svc__hero-glow" aria-hidden="true" />
        <h1 className="svc__h1">{content.h1}</h1>
        <p className="svc__sub">{content.heroSub}</p>
        <div className="svc__hero-actions">
          <Link href={`${base}#calculator`} className="svc__btn svc__btn--primary">
            {l.ctaPrimary}
          </Link>
          <Link href={`${base}#calculator`} className="svc__btn svc__btn--ghost">
            {content.cta}
          </Link>
        </div>
      </header>

      {/* Benefits */}
      <section className="svc__section">
        <h2 className="svc__h2">{l.benefitsTitle}</h2>
        <ul className="svc__benefits">
          {content.benefits.map((b, i) => (
            <li key={i} className="svc-benefit">
              <span className="svc-benefit__dot" aria-hidden="true" />
              <h3 className="svc-benefit__title">{b.title}</h3>
              <p className="svc-benefit__text">{b.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Narrative sections */}
      <section className="svc__prose">
        {content.sections.map((s, i) => (
          <div key={i} className="svc-block">
            <h2 className="svc-block__h">{s.heading}</h2>
            <p className="svc-block__b">{s.body}</p>
          </div>
        ))}
      </section>

      {/* Related portfolio */}
      {related.length > 0 && (
        <section className="svc__section svc__related">
          <h2 className="svc__h2">{l.relatedTitle}</h2>
          <p className="svc__related-sub">{l.relatedText}</p>
          <div className="svc__related-grid">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`${base}/portafolio/${p.slug}`}
                className="svc-case"
                style={{ "--bg": p.bg } as React.CSSProperties}
              >
                <span className="svc-case__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p[locale].title} loading="lazy" />
                </span>
                <span className="svc-case__name">{p[locale].title}</span>
                <span className="svc-case__desc">{p[locale].short}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="svc__section">
        <h2 className="svc__h2">{l.faqTitle}</h2>
        <FaqAccordion items={content.faq} />
      </section>

      {/* CTA */}
      <section className="svc__cta">
        <div className="svc__cta-panel">
          <h2 className="svc__cta-title">{l.ctaTitle}</h2>
          <p className="svc__cta-text">{l.ctaText}</p>
          <div className="svc__cta-actions">
            <Link href={`${base}#calculator`} className="svc__btn svc__btn--light">
              {l.ctaPrimary}
            </Link>
            <a href="https://wa.me/520000000000" className="svc__btn svc__btn--outline">
              {l.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* Keyword footer (semantic relevance) */}
      {keywords.length > 0 && (
        <aside className="svc__kw">
          <span className="svc__kw-label">{l.keywordsLabel}:</span>
          {keywords.slice(0, 10).map((k) => (
            <span key={k} className="svc__kw-chip">
              {k}
            </span>
          ))}
        </aside>
      )}
    </article>
  );
}
