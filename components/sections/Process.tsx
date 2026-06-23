import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";

export default function Process({ dict }: { dict: Dictionary }) {
  return (
    <section className="process" id="process">
      <div className="process__inner">
        <Reveal className="process__head">
          <p className="process__eyebrow">{dict.process.eyebrow}</p>
          <h2 className="process__title">{dict.process.title}</h2>
        </Reveal>

        <ol className="process__steps">
          {dict.process.steps.map((step, i) => (
            <Reveal key={step.title} as="li" className="process__step" delay={i * 110}>
              <span className="process__num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="process__step-title">{step.title}</h3>
              <p className="process__step-text">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
