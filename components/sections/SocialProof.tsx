import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";

// Real client brands (logos from the Hunter Price Mx era).
const BRANDS = [
  { name: "Casas Krea", file: "casas-krea" },
  { name: "Universidad Hebraica", file: "universidad-hebraica" },
  { name: "Sanatorio México", file: "sanatorio-mexico" },
  { name: "BDS Motos", file: "bds" },
  { name: "RCIU Education", file: "riu-logo" },
  { name: "SLA Academy Lab", file: "sla" },
  { name: "Interlace", file: "interlace" },
  { name: "Comint", file: "comint" },
  { name: "Tienda Forestal", file: "tienda-forestal" },
  { name: "Evolution Week", file: "evolution-week" },
  { name: "TAME", file: "tame" },
  { name: "Toma", file: "toma" },
];

export default function SocialProof({ dict }: { dict: Dictionary }) {
  return (
    <section className="social">
      <div className="social__inner">
        <Reveal className="social__head">
          <p className="social__eyebrow">{dict.social.eyebrow}</p>
          <h2 className="social__title">{dict.social.title}</h2>
          <p className="social__text">{dict.social.text}</p>
        </Reveal>

        <Reveal delay={120}>
          <p className="social__trusted">{dict.social.trusted}</p>
          <div className="social__marquee">
            <div className="social__track">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  className="social__row"
                  aria-hidden={copy === 1 ? "true" : undefined}
                >
                  {BRANDS.map((b) => (
                    <li key={`${copy}-${b.file}`} className="brand">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="brand__img"
                        src={`/brands/${b.file}.png`}
                        alt={b.name}
                        loading="lazy"
                        draggable={false}
                      />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
