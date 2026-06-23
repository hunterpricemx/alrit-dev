import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";

const TECH: { name: string; file?: string; text?: string }[] = [
  { name: "Next.js", file: "nextjs" },
  { name: "React", file: "react" },
  { name: "WordPress", file: "wordpress" },
  { name: "TypeScript", file: "typescript" },
  { name: "Supabase", file: "supabase" },
  { name: "AWS", text: "aws" },
  { name: "Stripe", file: "stripe" },
  { name: "React Native", file: "reactnative" },
];

export default function Technologies({ dict }: { dict: Dictionary }) {
  const t = dict.tech;

  return (
    <section className="tech">
      <Reveal className="tech__head">
        <p className="tech__eyebrow">{t.eyebrow}</p>
        <h2 className="tech__title">{t.title}</h2>
      </Reveal>

      <ul className="tech__grid">
        {TECH.map((item, i) => (
          <Reveal as="li" key={item.name} className="tech-card" delay={i * 45}>
            <span className="tech-card__logo">
              {item.file ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/tech/${item.file}.svg`} alt={item.name} loading="lazy" draggable={false} />
              ) : (
                <span className="tech-card__text">{item.text}</span>
              )}
            </span>
            <span className="tech-card__name">{item.name}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
