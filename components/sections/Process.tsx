import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";

const STEP_ICONS = [
  "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35", // search
  "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z", // pencil
  "m8 9-3 3 3 3m8-6 3 3-3 3M13 6l-2 12", // code
  "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.7-.84.69-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z", // rocket
];
const STEP_ACCENTS = ["#8a6bff", "#ec4899", "#fb8c2e", "#00b894"];

export default function Process({ dict }: { dict: Dictionary }) {
  const t = dict.process;

  return (
    <section className="proc" id="process">
      <Reveal className="proc__head">
        <p className="proc__eyebrow">{t.eyebrow}</p>
        <h2 className="proc__title">
          {t.titleA} <span className="proc__title-accent">{t.titleAccent}</span>
        </h2>
        <p className="proc__sub">{t.subtitle}</p>
      </Reveal>

      <ol className="proc__steps">
        {t.steps.map((s, i) => (
          <Reveal
            as="li"
            key={i}
            className="proc-step"
            delay={i * 90}
            style={{ "--accent": STEP_ACCENTS[i] } as React.CSSProperties}
          >
            <span className="proc-step__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={STEP_ICONS[i]} />
              </svg>
            </span>
            <span className="proc-step__num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="proc-step__title">{s.title}</h3>
            <p className="proc-step__text">{s.text}</p>
            <ul className="proc-step__items">
              {s.items.map((it) => (
                <li key={it}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l4 4 10-11" />
                  </svg>
                  {it}
                </li>
              ))}
            </ul>
            {i < t.steps.length - 1 && (
              <span className="proc-step__connector" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            )}
          </Reveal>
        ))}
      </ol>

      <Reveal className="proc__banner" delay={120}>
        <span className="proc__banner-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M6 4h12v4a6 6 0 0 1-12 0V4ZM9 18h6M10 22h4M12 14v4" />
          </svg>
        </span>
        {t.banner}
      </Reveal>
    </section>
  );
}
