"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { ServiceId } from "@/lib/services";
import { resolveSlot, mockupSlot, type SlotMap } from "@/lib/slots";

type Card = {
  src: string;
  alt: string;
  serviceId: ServiceId;
  rot: number;
  depth: number;
  floatDur: number;
  floatDelay: number;
};

const CARDS: Card[] = [
  { src: "/hero/sass.png", alt: "Plataforma y dashboard a la medida", serviceId: "systems", rot: 2, depth: 0.9, floatDur: 5.4, floatDelay: 0 },
  { src: "/hero/ecommerce.png", alt: "Tienda en línea (e-commerce)", serviceId: "ecommerce", rot: -3, depth: 1.3, floatDur: 6.1, floatDelay: -1.2 },
  { src: "/hero/realstate.png", alt: "Portal inmobiliario", serviceId: "realestate", rot: 6, depth: 1.7, floatDur: 4.8, floatDelay: -2.4 },
  { src: "/hero/app.png", alt: "App móvil", serviceId: "mobile", rot: -2, depth: 1.3, floatDur: 5.7, floatDelay: -0.6 },
  { src: "/hero/lms.png", alt: "Plataforma LMS de cursos", serviceId: "lms", rot: 2, depth: 0.9, floatDur: 6.4, floatDelay: -3 },
];

const PULL_RADIUS = 260;
const MAX_PULL = 28;
const MAX_PARALLAX = 16;

export default function MagneticHero({
  dict,
  locale,
  slotMap,
}: {
  dict: Dictionary;
  locale: Locale;
  slotMap?: SlotMap;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const magnetsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pointer = { x: 0, y: 0, active: false };

    const apply = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      magnetsRef.current.forEach((el) => {
        if (!el) return;
        const depth = Number(el.dataset.depth) || 1;
        let tx = 0;
        let ty = 0;

        if (pointer.active) {
          tx += ((pointer.x - cx) / rect.width) * MAX_PARALLAX * depth;
          ty += ((pointer.y - cy) / rect.height) * MAX_PARALLAX * depth;

          const b = el.getBoundingClientRect();
          const bx = b.left + b.width / 2;
          const by = b.top + b.height / 2;
          const dx = pointer.x - bx;
          const dy = pointer.y - by;
          const dist = Math.hypot(dx, dy);
          if (dist < PULL_RADIUS) {
            const falloff = 1 - dist / PULL_RADIUS;
            tx += (dx / (dist || 1)) * MAX_PULL * falloff;
            ty += (dy / (dist || 1)) * MAX_PULL * falloff;
          }
        }

        el.style.setProperty("--mx", `${tx.toFixed(2)}px`);
        el.style.setProperty("--my", `${ty.toFixed(2)}px`);
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY, active: true };
      schedule();
    };
    const onLeave = () => {
      pointer.active = false;
      schedule();
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const base = `/${locale}`;

  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <span className="hero__spark" aria-hidden="true" />

      <header className="hero__head">
        <h1 className="hero__title">
          <span className="hero__title-line">{dict.hero.titleA}</span>
          <span className="hero__title-line hero__title-line--2">
            <span className="hero__title-accent">{dict.hero.titleAccent}</span>
          </span>
        </h1>
      </header>

      <div className="hero__stage" ref={stageRef}>
        <div className="hero__cards">
          {CARDS.map((card, i) => (
            <div
              key={card.src}
              className="hero__card"
              style={{ "--rot": `${card.rot}deg`, "--i": i } as React.CSSProperties}
            >
              <div
                className="hero__card-magnet"
                data-depth={card.depth}
                ref={(el) => {
                  if (el) magnetsRef.current[i] = el;
                }}
              >
                <div
                  className="hero__card-media"
                  style={
                    {
                      "--float-dur": `${card.floatDur}s`,
                      "--float-delay": `${card.floatDelay}s`,
                    } as React.CSSProperties
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="hero__card-img" src={resolveSlot(slotMap, mockupSlot(card.serviceId), card.src)} alt={card.alt} draggable={false} />
                  <span className="hero__card-label">
                    {dict.services.items[card.serviceId].title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="hero__lede">{dict.hero.lede}</p>

      <div className="hero__actions">
        <Link href={`${base}#calculator`} className="hero__btn hero__btn--primary">
          {dict.hero.primary}
        </Link>
        <Link href={`${base}#portfolio`} className="hero__btn hero__btn--ghost">
          {dict.hero.secondary}
        </Link>
      </div>
    </section>
  );
}
