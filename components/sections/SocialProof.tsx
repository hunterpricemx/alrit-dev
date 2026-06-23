import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";

const LOGOS = ["Acme", "Nimbus", "Vertex", "Lumina", "Forge", "Cobalt"];

export default function SocialProof({ dict }: { dict: Dictionary }) {
  return (
    <section className="social">
      <div className="social__inner">
        <Reveal className="social__head">
          <p className="social__eyebrow">{dict.social.eyebrow}</p>
          <h2 className="social__title">{dict.social.title}</h2>
          <p className="social__text">{dict.social.text}</p>
        </Reveal>

        <Reveal className="social__logos" delay={120}>
          {LOGOS.map((logo) => (
            <span key={logo} className="social__logo">
              {logo}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
