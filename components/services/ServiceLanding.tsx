import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { ServiceLocaleContent } from "@/lib/content/services";
import type { Project } from "@/lib/content/portfolio";
import Reveal from "@/components/ui/Reveal";
import Tilt from "@/components/ui/Tilt";
import FaqAccordion from "./FaqAccordion";

export default function ServiceLanding({
  locale,
  dict,
  content,
  accent,
  icon,
  serviceTitle,
  keywords,
  related,
}: {
  locale: Locale;
  dict: Dictionary;
  content: ServiceLocaleContent;
  accent: string;
  icon: string;
  serviceTitle: string;
  keywords: string[];
  related: Project[];
}) {
  const l = dict.serviceLanding;
  const base = `/${locale}`;

  return (
    <article className="svc" style={{ "--accent": accent } as React.CSSProperties}>
      <nav className="svc__crumbs" aria-label="Breadcrumb">
        <Link href={base}>{l.home}</Link>
        <span aria-hidden="true">/</span>
        <Link href={`${base}/servicios`}>{l.services}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{serviceTitle}</span>
      </nav>

      {/* Hero */}
      <Reveal className="svc__hero">
        <span className="svc__spark" aria-hidden="true" />
        <span className="svc__hero-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </span>
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
      </Reveal>

      {/* Benefits */}
      <section className="svc__section">
        <Reveal>
          <h2 className="svc__h2">{l.benefitsTitle}</h2>
        </Reveal>
        <ul className="svc__benefits">
          {content.benefits.map((b, i) => (
            <Reveal as="li" key={i} delay={i * 60}>
              <Tilt className="svc-benefit">
                <span className="svc-benefit__bar" aria-hidden="true" />
                <h3 className="svc-benefit__title">{b.title}</h3>
                <p className="svc-benefit__text">{b.text}</p>
              </Tilt>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Narrative sections */}
      <section className="svc__prose">
        {content.sections.map((s, i) => (
          <Reveal key={i} className="svc-block" delay={i * 40}>
            <span className="svc-block__rule" aria-hidden="true" />
            <h2 className="svc-block__h">{s.heading}</h2>
            <p className="svc-block__b">{s.body}</p>
          </Reveal>
        ))}
      </section>

      {/* Related portfolio */}
      {related.length > 0 && (
        <section className="svc__section svc__related">
          <Reveal>
            <h2 className="svc__h2">{l.relatedTitle}</h2>
            <p className="svc__related-sub">{l.relatedText}</p>
          </Reveal>
          <div className="svc__related-grid">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}>
                <Tilt>
                  <Link
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
                </Tilt>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="svc__section">
        <Reveal>
          <h2 className="svc__h2">{l.faqTitle}</h2>
        </Reveal>
        <FaqAccordion items={content.faq} />
      </section>

      {/* CTA */}
      <section className="svc__cta">
        <Reveal className="svc__cta-panel">
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
        </Reveal>
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
