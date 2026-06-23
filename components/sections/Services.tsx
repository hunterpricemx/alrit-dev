"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { SERVICES, type ServiceId } from "@/lib/services";

const HOME_IDS = ["webdev", "lms", "ecommerce", "realestate", "mobile", "systems"] as const;

// Card mockups (placeholders reusing hero art until the final images arrive).
const CARD_IMG: Partial<Record<ServiceId, string>> = {
  webdev: "/hero/sass.png",
  lms: "/hero/lms.png",
  ecommerce: "/hero/ecommerce.png",
  realestate: "/hero/realstate.png",
  mobile: "/hero/app.png",
};

const STAT_ICONS = [
  // rocket
  "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.7-.84.69-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0 M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
  // code
  "m8 9-3 3 3 3m8-6 3 3-3 3M13 6l-2 12",
  // globe
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c-3 2.6-3 15.4 0 18m0-18c3 2.6 3 15.4 0 18M3.6 9h16.8M3.6 15h16.8",
];
const STAT_ACCENTS = ["#6c5ce7", "#e84393", "#fd9644"];

const LOGOS = [
  { name: "Interlace", file: "interlace" },
  { name: "Comint", file: "comint" },
  { name: "Tierra Forestal", file: "tienda-forestal" },
  { name: "Evolution Week", file: "evolution-week" },
  { name: "TAME", file: "tame" },
  { name: "Toma", file: "toma" },
  { name: "Casa Klik", file: "casas-krea" },
];

const BADGE_ICONS = [
  "M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z|m9 12 2 2 4-4",
  "M6 10V7a6 6 0 1 1 12 0v3|M5 10h14v10H5z",
];

export default function Services({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.servicesX;
  const viewportRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".svcx-card");
    const step = card ? card.offsetWidth + 20 : 1;
    setActive(Math.round(el.scrollLeft / step));
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollToCard = (index: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".svcx-card");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollTo({ left: index * step, behavior: "smooth" });
  };

  return (
    <section className="svcx" id="services">
      <div className="svcx__inner">
        {/* Header: intro + stats */}
        <div className="svcx__top">
          <div className="svcx__intro">
            <p className="svcx__eyebrow">{t.eyebrow}</p>
            <h2 className="svcx__title">
              {t.titleA} <span className="svcx__title-accent">{t.titleAccent}</span>
            </h2>
            <p className="svcx__sub">{t.subtitle}</p>
          </div>

          <ul className="svcx__stats">
            {t.stats.map((s, i) => (
              <li
                key={i}
                className="svcx-stat"
                style={{ "--accent": STAT_ACCENTS[i] } as React.CSSProperties}
              >
                <span className="svcx-stat__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={STAT_ICONS[i]} />
                  </svg>
                </span>
                <span className="svcx-stat__value">{s.value}</span>
                <span className="svcx-stat__label">{s.label}</span>
                <span className="svcx-stat__caption">{s.caption}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cards carousel */}
        <ul className="svcx__viewport" ref={viewportRef}>
          {HOME_IDS.map((id) => {
            const svc = SERVICES.find((s) => s.id === id)!;
            const copy = t.cards[id];
            const img = CARD_IMG[id];
            return (
              <li
                key={id}
                className="svcx-card"
                style={{ "--accent": svc.accent } as React.CSSProperties}
              >
                <Link href={`/${locale}/servicios/${svc.slug}`} className="svcx-card__link">
                  <div className="svcx-card__top">
                    <span className="svcx-card__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d={svc.icon} />
                      </svg>
                    </span>
                    <span className="svcx-card__plus" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="svcx-card__title">{copy.title}</h3>
                  <p className="svcx-card__text">{copy.text}</p>
                  <span className="svcx-card__shot">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={copy.title} loading="lazy" draggable={false} />
                    ) : (
                      <span className="svcx-card__shot-ph" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d={svc.icon} />
                        </svg>
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Controls: arrows + dots */}
        <div className="svcx__controls">
          <button
            type="button"
            className="svcx__arrow"
            aria-label="Anterior"
            disabled={atStart}
            onClick={() => scrollToCard(Math.max(0, active - 1))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <div className="svcx__dots">
            {HOME_IDS.map((id, i) => (
              <button
                key={id}
                type="button"
                className={`svcx__dot${i === active ? " svcx__dot--active" : ""}`}
                aria-label={`Ir a la tarjeta ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => scrollToCard(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="svcx__arrow"
            aria-label="Siguiente"
            disabled={atEnd}
            onClick={() => scrollToCard(active + 1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Trust bar */}
        <div className="svcx__trust">
          <div className="svcx__trust-row">
            <p className="svcx__trust-label">{t.trust}</p>
            <ul className="svcx__logos">
              {LOGOS.map((b) => (
                <li key={b.file} className="svcx__logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/brands/${b.file}.png`} alt={b.name} loading="lazy" draggable={false} />
                </li>
              ))}
            </ul>
          </div>
          <ul className="svcx__badges">
            {t.badges.map((b, i) => {
              const [main, check] = BADGE_ICONS[i].split("|");
              return (
                <li key={i} className="svcx-badge">
                  <span className="svcx-badge__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={main} />
                      {check && <path d={check} />}
                    </svg>
                  </span>
                  <span className="svcx-badge__body">
                    <span className="svcx-badge__title">{b.title}</span>
                    <span className="svcx-badge__text">{b.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
