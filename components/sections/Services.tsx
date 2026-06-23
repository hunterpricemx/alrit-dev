"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { SERVICES, type ServiceId } from "@/lib/services";

export default function Services({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const viewportRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<ServiceId | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateArrows = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".gallery-card");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="gallery" id="services">
      <div className="gallery__head">
        <p className="gallery__eyebrow">{dict.services.eyebrow}</p>
        <h2 className="gallery__title">{dict.services.title2}</h2>
      </div>

      <ul className="gallery__viewport" ref={viewportRef}>
        {SERVICES.map((service) => {
          const copy = dict.services.items[service.id];
          const isOpen = open === service.id;
          return (
            <li
              key={service.id}
              className={`gallery-card gallery-card--${service.tone}${
                isOpen ? " gallery-card--open" : ""
              }`}
              style={{ "--accent": service.accent } as React.CSSProperties}
            >
              <Link
                href={`/${locale}/servicios/${service.slug}`}
                className="gallery-card__media"
                tabIndex={isOpen ? -1 : 0}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="gallery-card__img"
                  src={service.image}
                  alt={copy.title}
                  loading="lazy"
                  draggable={false}
                />
              </Link>

              <div className="gallery-card__head">
                <p className="gallery-card__eyebrow">{copy.eyebrow}</p>
                <h3 className="gallery-card__name">{copy.title}</h3>
              </div>

              <div className="gallery-card__panel" aria-hidden={!isOpen}>
                <p className="gallery-card__text">{copy.text}</p>
                <Link
                  href={`/${locale}/servicios/${service.slug}`}
                  className="gallery-card__link"
                  tabIndex={isOpen ? 0 : -1}
                >
                  {dict.services.cta}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>

              <button
                type="button"
                className="gallery-card__toggle"
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Cerrar" : "Más información"} — ${copy.title}`}
                onClick={() => setOpen(isOpen ? null : service.id)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="gallery__controls">
        <button
          type="button"
          className="gallery__arrow"
          aria-label="Anterior"
          disabled={atStart}
          onClick={() => scrollByCard(-1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          className="gallery__arrow"
          aria-label="Siguiente"
          disabled={atEnd}
          onClick={() => scrollByCard(1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
