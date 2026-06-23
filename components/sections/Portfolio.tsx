import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";

const PROJECTS = [
  { seed: "alrit-p1", tag: "E-commerce", span: "wide" },
  { seed: "alrit-p2", tag: "WordPress", span: "tall" },
  { seed: "alrit-p3", tag: "LMS", span: "normal" },
  { seed: "alrit-p4", tag: "Real Estate", span: "normal" },
  { seed: "alrit-p5", tag: "Sistema", span: "wide" },
];

export default function Portfolio({ dict }: { dict: Dictionary }) {
  return (
    <section className="portfolio" id="portfolio">
      <div className="portfolio__inner">
        <Reveal className="portfolio__head">
          <p className="portfolio__eyebrow">{dict.portfolio.eyebrow}</p>
          <h2 className="portfolio__title">{dict.portfolio.title}</h2>
          <p className="portfolio__text">{dict.portfolio.text}</p>
        </Reveal>

        <div className="portfolio__grid">
          {PROJECTS.map((p, i) => (
            <Reveal
              key={p.seed}
              className={`portfolio__item portfolio__item--${p.span}`}
              delay={i * 80}
            >
              <figure className="project-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="project-card__img"
                  src={`https://picsum.photos/seed/${p.seed}/900/700`}
                  alt={`${p.tag} — proyecto placeholder`}
                  loading="lazy"
                />
                <figcaption className="project-card__cap">
                  <span className="project-card__tag">{p.tag}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
