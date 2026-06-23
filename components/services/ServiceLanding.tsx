import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { ServiceLocaleContent } from "@/lib/content/services";
import type { Project } from "@/lib/content/portfolio";
import Reveal from "@/components/ui/Reveal";
import Tilt from "@/components/ui/Tilt";
import FaqAccordion from "./FaqAccordion";

const BENEFIT_ACCENTS = ["#8a6bff", "#22c55e", "#3b82f6"];
const BENEFIT_ICONS = [
  "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z", // dashboard tiles
  "M13 2 4 14h7l-1 8 9-12h-7z", // lightning
  "M3 17l6-6 4 4 7-7M14 8h6v6", // trending up
  "M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Zm-3 9 2 2 4-4", // shield + check
  "M10 4a2 2 0 1 1 4 0v1h3a1 1 0 0 1 1 1v3h1a2 2 0 1 1 0 4h-1v3a1 1 0 0 1-1 1h-3v-1a2 2 0 1 0-4 0v1H7a1 1 0 0 1-1-1v-3H5a2 2 0 1 1 0-4h1V6a1 1 0 0 1 1-1h3z", // puzzle
  "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z", // pencil
];

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
      <section className="svc__section svc__benefits-section">
        <Reveal className="svc__benefits-head">
          <p className="svc__benefits-eyebrow">{l.benefitsEyebrow}</p>
          <h2 className="svc__benefits-title">
            {l.benefitsTitleA}{" "}
            <span className="svc__benefits-accent">
              {l.benefitsTitleAccent}
              <svg className="svc__benefits-underline" viewBox="0 0 200 14" fill="none" aria-hidden="true" preserveAspectRatio="none">
                <path d="M3 9c40-7 120-9 194-3" stroke="url(#svcUnder)" strokeWidth="4" strokeLinecap="round" />
                <defs>
                  <linearGradient id="svcUnder" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff8a3d" /><stop offset="0.5" stopColor="#ff4d8d" /><stop offset="1" stopColor="#8a6bff" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>
        </Reveal>
        <ul className="svc__benefits">
          {content.benefits.map((b, i) => (
            <Reveal
              as="li"
              key={i}
              delay={i * 60}
              style={{ "--accent": BENEFIT_ACCENTS[i % BENEFIT_ACCENTS.length] } as React.CSSProperties}
            >
              <Tilt className="svc-benefit">
                <span className="svc-benefit__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={BENEFIT_ICONS[i % BENEFIT_ICONS.length]} />
                  </svg>
                </span>
                <span className="svc-benefit__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="svc-benefit__title">{b.title}</h3>
                <p className="svc-benefit__text">{b.text}</p>
                <span className="svc-benefit__bar" aria-hidden="true" />
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
