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
const ROCKET_ICON = "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.7-.84.69-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0 M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5";
const FLOW_ICON = "M5 4h4v4H5zM15 4h4v4h-4zM10 16h4v4h-4zM7 8v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8M12 12v4";
const DIFF_ICONS = [
  "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm2.5-2.5 2.5-2.5M4.2 18a9 9 0 1 1 15.6 0", // gauge
  "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35", // magnifier
  "M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z", // shield
  "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", // dollar
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

  // Accent the last word of a heading (e.g. "...con Alrit.dev")
  const accentLast = (text: string, cls: string) => {
    const parts = text.trim().split(" ");
    const last = parts.pop() ?? "";
    return (
      <>
        {parts.join(" ")} <span className={cls}>{last}</span>
      </>
    );
  };

  const half = Math.ceil(content.faq.length / 2);
  const faqLeft = content.faq.slice(0, half);
  const faqRight = content.faq.slice(half);

  const Check = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l4 4 10-10" />
    </svg>
  );

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

      {/* Qué incluye — prose + checklist */}
      {content.sections[0] && (
        <Reveal as="section" className="svc-card svc-card--incl" style={{ "--accent": "#8a6bff" } as React.CSSProperties}>
          <div className="svc-card__main">
            <span className="svc-card__bar" aria-hidden="true" />
            <span className="svc-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
            </span>
            <h2 className="svc-card__h">{accentLast(content.sections[0].heading, "svc-card__accent")}</h2>
            <p className="svc-card__p">{content.sections[0].body}</p>
          </div>
          <ul className="svc-incl">
            {l.includes.map((it) => (
              <li key={it} className="svc-incl__item">
                <span className="svc-incl__check" aria-hidden="true"><Check /></span>
                {it}
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {/* Por qué — prose + diferenciadores */}
      {content.sections[1] && (
        <Reveal as="section" className="svc-card svc-card--why" style={{ "--accent": "#22c55e" } as React.CSSProperties}>
          <div className="svc-card__main">
            <span className="svc-card__bar" aria-hidden="true" />
            <span className="svc-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={ROCKET_ICON} />
              </svg>
            </span>
            <h2 className="svc-card__h">{accentLast(content.sections[1].heading, "svc-card__accent")}</h2>
            <p className="svc-card__p">{content.sections[1].body}</p>
          </div>
          <div className="svc-why">
            {l.differentiators.map((d, i) => (
              <div key={d.title} className="svc-feat">
                <span className="svc-feat__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={DIFF_ICONS[i % DIFF_ICONS.length]} />
                  </svg>
                </span>
                <span className="svc-feat__title">{d.title}</span>
                <span className="svc-feat__sub">{d.sub}</span>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* Cómo trabajamos — stepper */}
      <Reveal as="section" className="svc-card svc-card--steps" style={{ "--accent": "#3b82f6" } as React.CSSProperties}>
        <div className="svc-card__main svc-card__main--full">
          <span className="svc-card__bar" aria-hidden="true" />
          <span className="svc-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d={FLOW_ICON} />
            </svg>
          </span>
          <h2 className="svc-card__h">
            {l.stepsTitle} <span className="svc-card__accent">{l.stepsTitleAccent}</span>
          </h2>
        </div>
        <ol className="svc-steps">
          {l.steps.map((s, i) => (
            <li key={s.title} className="svc-step">
              <span className="svc-step__num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="svc-step__title">{s.title}</h3>
              <p className="svc-step__text">{s.text}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Proyectos relacionados */}
      {related.length > 0 && (
        <section className="svc__section">
          <Reveal className="svc-rel__head">
            <div>
              <h2 className="svc__h2">{l.relatedTitle}</h2>
              <p className="svc__related-sub">{l.relatedText}</p>
            </div>
            <Link href={`${base}/portafolio`} className="svc-rel__all">
              {dict.portfolio.cta}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </Reveal>
          <div className="svc-rel__grid">
            {related.slice(0, 2).map((p, i) => (
              <Reveal as="article" key={p.slug} className="svc-rcase" delay={i * 80}>
                <Link href={`${base}/portafolio/${p.slug}`} className="svc-rcase__media" style={{ "--bg": p.bg } as React.CSSProperties}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p[locale].title} loading="lazy" />
                </Link>
                <div className="svc-rcase__body">
                  <span className="svc-rcase__cat">
                    {dict.portfolio.categories[p.cat as keyof typeof dict.portfolio.categories]}
                  </span>
                  <h3 className="svc-rcase__name">{p[locale].title}</h3>
                  <p className="svc-rcase__desc">{p[locale].short}</p>
                  {p.highlights.length > 0 && (
                    <ul className="svc-rcase__feats">
                      {p.highlights.slice(0, 4).map((h) => (
                        <li key={h}><span className="svc-rcase__check" aria-hidden="true"><Check /></span>{h}</li>
                      ))}
                    </ul>
                  )}
                  <Link href={`${base}/portafolio/${p.slug}`} className="svc-rcase__link">
                    {l.relatedCta}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="svc__section">
        <Reveal className="svc-faq__head">
          <h2 className="svc__h2">{l.faqTitle}</h2>
          <span className="svc-faq__badge">{l.faqBadge}</span>
        </Reveal>
        <div className="svc-faq__cols">
          <FaqAccordion items={faqLeft} />
          {faqRight.length > 0 && <FaqAccordion items={faqRight} defaultOpen={null} />}
        </div>
      </section>

      {/* CTA */}
      <section className="svc__cta">
        <Reveal className="svc-cta2">
          <span className="svc-cta2__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d={ROCKET_ICON} />
            </svg>
          </span>
          <div className="svc-cta2__copy">
            <h2 className="svc-cta2__title">{accentLast(l.ctaTitle, "svc-cta2__accent")}</h2>
            <p className="svc-cta2__text">{l.ctaText}</p>
          </div>
          <div className="svc-cta2__actions">
            <Link href={`${base}#calculator`} className="svc-cta2__btn svc-cta2__btn--primary">
              {l.ctaPrimary}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <a href="https://wa.me/520000000000" className="svc-cta2__btn svc-cta2__btn--ghost">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.4.5-.3.3c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l2 .9c.3.1.5.2.5.4.1.2.1.9-.1 1.5Z" /></svg>
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
