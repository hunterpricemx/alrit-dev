import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { SERVICES } from "@/lib/services";
import Reveal from "@/components/ui/Reveal";

export default function Services({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <section className="services" id="services">
      <div className="services__inner">
        <Reveal className="services__head">
          <p className="services__eyebrow">{dict.services.eyebrow}</p>
          <h2 className="services__title">{dict.services.title}</h2>
        </Reveal>

        <ul className="services__grid">
          {SERVICES.map((service, i) => {
            const copy = dict.services.items[service.id];
            return (
              <Reveal
                key={service.id}
                as="li"
                className="services__cell"
                delay={i * 70}
              >
                <Link
                  href={`/${locale}/servicios/${service.slug}`}
                  className="service-card"
                  style={{ "--accent": service.accent } as React.CSSProperties}
                >
                  <span className="service-card__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={service.icon} />
                    </svg>
                  </span>
                  <h3 className="service-card__title">{copy.title}</h3>
                  <p className="service-card__text">{copy.text}</p>
                  <span className="service-card__cta">
                    {dict.services.cta}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
