import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";

const STAT_ICONS = [
  "M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z", // folder
  "M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z", // calendar
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c-3 2.6-3 15.4 0 18m0-18c3 2.6 3 15.4 0 18M3.6 9h16.8M3.6 15h16.8", // globe
  "M3 17l6-6 4 4 7-7M14 8h6v6", // trending up
  "M3 14v-1a9 9 0 0 1 18 0v1M5 12h1v7H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm14 0h-1v7h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2ZM12 21h3", // headset
];
const STAT_ACCENTS = ["#8a6bff", "#ec4899", "#fb8c2e", "#00b894", "#8a6bff"];

export default function Results({ dict }: { dict: Dictionary }) {
  const t = dict.results;

  return (
    <section className="results">
      <Reveal className="results__head">
        <p className="results__eyebrow">{t.eyebrow}</p>
        <h2 className="results__title">
          {t.titleA} <span className="results__title-accent">{t.titleAccent}</span>
        </h2>
      </Reveal>

      <ul className="results__grid">
        {t.stats.map((s, i) => (
          <Reveal
            as="li"
            key={i}
            className="rstat"
            delay={i * 70}
            style={{ "--accent": STAT_ACCENTS[i] } as React.CSSProperties}
          >
            <span className="rstat__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={STAT_ICONS[i]} />
              </svg>
            </span>
            <span className="rstat__value">{s.value}</span>
            <span className="rstat__label">{s.label}</span>
            <span className="rstat__caption">{s.caption}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
