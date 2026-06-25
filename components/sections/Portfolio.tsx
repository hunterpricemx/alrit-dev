import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Project } from "@/lib/content/portfolio";
import { PORTFOLIO_ICONS, iconForCat } from "@/lib/content/portfolio-icons";
import Reveal from "@/components/ui/Reveal";

const AREAS = ["a", "b", "c", "d", "e"] as const;
const ACCENTS = ["#e84393", "#00b894", "#8a6bff", "#ff4d6d", "#fb8c2e"];

export default function Portfolio({
  dict,
  locale,
  projects,
}: {
  dict: Dictionary;
  locale: Locale;
  projects: Project[];
}) {
  const p = dict.portfolio;
  const ordered = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
  const items = ordered.slice(0, 5).map((proj, i) => ({
    slug: proj.slug,
    area: AREAS[i],
    accent: proj.accent || ACCENTS[i],
    iconPath: PORTFOLIO_ICONS[proj.icon || iconForCat(proj.cat)] ?? PORTFOLIO_ICONS.users,
    image: proj.image,
    name: proj[locale].name || proj[locale].title,
    cat: proj.cat,
    featured: i === 0,
    desc: proj[locale].short,
    features: proj.highlights.slice(0, 3),
    stack: proj.tags,
  }));

  return (
    <section className="pf2" id="portfolio">
      <Reveal className="pf2__head">
        <div className="pf2__intro">
          <p className="pf2__eyebrow">{p.eyebrow}</p>
          <h2 className="pf2__title">{p.title}</h2>
          <p className="pf2__sub">{p.text}</p>
        </div>
        <Link href={`/${locale}/portafolio`} className="pf2__all">
          {p.cta}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </Reveal>

      <div className="pf2__grid">
        {items.map((b, i) => (
          <Link
            key={b.slug}
            href={`/${locale}/portafolio/${b.slug}`}
            className={`pf2-card${b.featured ? " pf2-card--featured" : ""}`}
            style={{ gridArea: b.area, "--accent": b.accent, "--i": i } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pf2-card__bg" src={b.image} alt="" aria-hidden="true" loading="lazy" draggable={false} />
            <span className="pf2-card__scrim" aria-hidden="true" />

            <span className="pf2-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={b.iconPath} />
              </svg>
            </span>

            <span className="pf2-card__body">
              <span className="pf2-card__eyebrow">{p.categories[b.cat as keyof typeof p.categories]}</span>
              <span className="pf2-card__name">{b.name}</span>
              <span className="pf2-card__desc">{b.desc}</span>

              {b.features.length > 0 && (
                <ul className="pf2-card__features">
                  {b.features.map((f) => (
                    <li key={f}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12l4 4 10-11" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <span className="pf2-card__foot">
                <span className="pf2-card__btn">
                  {b.featured ? p.seeMoreFeatured : p.seeMore}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
                <span className="pf2-card__stack">{b.stack.join(" · ")}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
