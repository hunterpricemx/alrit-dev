"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

type ProjectArt = { seed: string; slug: string; bg: string };

// Visual data (placeholder art + soft tinted backgrounds). Copy lives in the dict.
const PROJECTS: ProjectArt[] = [
  { seed: "alrit-pf-aurora", slug: "tienda-aurora", bg: "#fdecef" },
  { seed: "alrit-pf-edu", slug: "edumas-lms", bg: "#e9f0fe" },
  { seed: "alrit-pf-vertice", slug: "inmobiliaria-vertice", bg: "#e7f7f0" },
  { seed: "alrit-pf-sazon", slug: "sazon-bistro", bg: "#fdf0e6" },
  { seed: "alrit-pf-logi", slug: "logitrack", bg: "#eeeafc" },
  { seed: "alrit-pf-pulse", slug: "pulsefit", bg: "#fdeaf2" },
];

export default function Portfolio({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const viewportRef = useRef<HTMLUListElement>(null);
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
    const card = el.querySelector<HTMLElement>(".family-card");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="family" id="portfolio">
      <div className="family__head">
        <div>
          <p className="family__eyebrow">{dict.portfolio.eyebrow}</p>
          <h2 className="family__title">{dict.portfolio.title}</h2>
        </div>
        <Link href={`/${locale}/portafolio`} className="family__all">
          {dict.portfolio.cta}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <ul className="family__viewport" ref={viewportRef}>
        {PROJECTS.map((art, i) => {
          const copy = dict.portfolio.projects[i];
          if (!copy) return null;
          return (
            <li key={art.slug} className="family-card">
              <Link
                href={`/${locale}/portafolio/${art.slug}`}
                className="family-card__media"
                style={{ "--bg": art.bg } as React.CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="family-card__img"
                  src={`https://picsum.photos/seed/${art.seed}/800/800`}
                  alt={copy.name}
                  loading="lazy"
                  draggable={false}
                />
              </Link>

              <h3 className="family-card__name">{copy.name}</h3>
              <p className="family-card__desc">{copy.desc}</p>

              <div className="family-card__actions">
                <Link
                  href={`/${locale}/portafolio/${art.slug}`}
                  className="family-card__btn"
                >
                  {dict.portfolio.seeMore}
                </Link>
                <Link href={`/${locale}#calculator`} className="family-card__link">
                  {dict.portfolio.quote}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="family__controls">
        <button
          type="button"
          className="family__arrow"
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
          className="family__arrow"
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
