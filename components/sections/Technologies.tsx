import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";
import type { LogoItem } from "@/lib/content/logos.data";

export default function Technologies({ dict, techLogos }: { dict: Dictionary; techLogos: LogoItem[] }) {
  const t = dict.tech;

  return (
    <section className="tech">
      <Reveal className="tech__head">
        <p className="tech__eyebrow">{t.eyebrow}</p>
        <h2 className="tech__title">{t.title}</h2>
      </Reveal>

      <ul className="tech__grid">
        {techLogos.map((item, i) => (
          <Reveal as="li" key={item.name} className="tech-card" delay={i * 45}>
            <span className="tech-card__logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name} loading="lazy" draggable={false} />
            </span>
            <span className="tech-card__name">{item.name}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
