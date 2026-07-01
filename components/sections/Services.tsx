"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { SERVICES, type ServiceId } from "@/lib/services";
import { resolveSlot, mockupSlot, type SlotMap } from "@/lib/slots";
import type { LogoItem } from "@/lib/content/logos.data";
import { PROMO_PRICES, PROJECT_TYPES, isPromoActive, formatMXN, type ProjectTypeId } from "@/lib/pricing";

const HOME_IDS = ["ecommerce", "lms", "systems", "mobile", "automation", "realestate", "chatbots"] as const;

// Mapea la tarjeta de la home a un tipo de la calculadora para mostrar "Desde $X" (promo).
const CARD_TYPE: Partial<Record<ServiceId, ProjectTypeId>> = {
  ecommerce: "ecommerce",
  lms: "lms",
  realestate: "realestate",
  mobile: "mobile",
};

// Card mockups (placeholders reusing hero art until the final images arrive).
const CARD_IMG: Partial<Record<ServiceId, string>> = {
  ecommerce: "/hero/ecommerce.png",
  lms: "/hero/lms.png",
  systems: "/hero/sass.png",
  mobile: "/hero/app.png",
  realestate: "/hero/realstate.png",
};

const BADGE_ICONS = [
  "M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z|m9 12 2 2 4-4",
  "M6 10V7a6 6 0 1 1 12 0v3|M5 10h14v10H5z",
];

export default function Services({
  dict,
  locale,
  slotMap,
  logos,
}: {
  dict: Dictionary;
  locale: Locale;
  slotMap?: SlotMap;
  logos: LogoItem[];
}) {
  const t = dict.servicesX;
  const promoActive = isPromoActive();
  const viewportRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [paused, setPaused] = useState(false);

  const update = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".svcx-card");
    const step = card ? card.offsetWidth + 20 : 1;
    const idx = Math.round(el.scrollLeft / step);
    activeRef.current = idx;
    setActive(idx);
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

  const scrollToCard = useCallback((index: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".svcx-card");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollTo({ left: index * step, behavior: "smooth" });
  }, []);

  // Autoplay (loops back to start; pauses on hover / reduced motion).
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const el = viewportRef.current;
      if (!el) return;
      const atEndNow = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      scrollToCard(atEndNow ? 0 : activeRef.current + 1);
    }, 3800);
    return () => clearInterval(id);
  }, [paused, scrollToCard]);

  // Drag-to-scroll (mouse). Touch uses native scrolling.
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = viewportRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.classList.add("is-dragging");
    setPaused(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const el = viewportRef.current;
    if (!el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    el.scrollLeft = d.startScroll - dx;
  };
  const endDrag = () => {
    const el = viewportRef.current;
    if (el) el.classList.remove("is-dragging");
    drag.current.active = false;
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <section className="svcx" id="services">
      <div className="svcx__inner">
        {/* Header */}
        <div className="svcx__top">
          <div className="svcx__intro">
            <p className="svcx__eyebrow">{t.eyebrow}</p>
            <h2 className="svcx__title">
              {t.titleA} <span className="svcx__title-accent">{t.titleAccent}</span>
            </h2>
            <p className="svcx__sub">{t.subtitle}</p>
          </div>
        </div>

        {/* Cards carousel */}
        <ul
          className="svcx__viewport"
          ref={viewportRef}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => {
            endDrag();
            setPaused(false);
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onClickCapture={onClickCapture}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {HOME_IDS.map((id) => {
            const svc = SERVICES.find((s) => s.id === id)!;
            const copy = t.cards[id];
            const img = resolveSlot(slotMap, mockupSlot(id), CARD_IMG[id] ?? "");
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
                  {(() => {
                    const typeId = CARD_TYPE[id];
                    const base = typeId ? PROJECT_TYPES.find((p) => p.id === typeId)?.base ?? null : null;
                    if (base == null) return null;
                    const promo = promoActive && typeId ? PROMO_PRICES[typeId] ?? null : null;
                    return (
                      <span className="mt-1 block text-sm font-semibold text-stone-700">
                        {t.priceFrom} {formatMXN(promo ?? base)}
                        {promo != null && <s className="ml-1.5 font-normal text-stone-400">{formatMXN(base)}</s>}
                      </span>
                    );
                  })()}
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
          <p className="svcx__trust-label">{t.trust}</p>
          <ul className="svcx__logos">
            {logos.map((b) => (
              <li key={b.name} className="svcx__logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.name} loading="lazy" draggable={false} />
              </li>
            ))}
          </ul>
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
