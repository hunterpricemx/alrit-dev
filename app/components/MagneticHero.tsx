"use client";

import { useEffect, useRef } from "react";

type Card = {
  src: string;
  alt: string;
  rot: number; // base tilt in deg (from reference: 2, -3, 6, -2, 2)
  depth: number; // parallax weight
  floatDur: number; // float animation duration (s)
  floatDelay: number; // float phase offset (s)
};

const CARDS: Card[] = [
  { src: "https://picsum.photos/seed/alrit-vr/600", alt: "Proyecto inmersivo", rot: 2, depth: 0.9, floatDur: 5.4, floatDelay: 0 },
  { src: "https://picsum.photos/seed/alrit-form/600", alt: "Identidad de marca", rot: -3, depth: 1.3, floatDur: 6.1, floatDelay: -1.2 },
  { src: "https://picsum.photos/seed/alrit-jar/600", alt: "Producto digital", rot: 6, depth: 1.7, floatDur: 4.8, floatDelay: -2.4 },
  { src: "https://picsum.photos/seed/alrit-spoon/600", alt: "Campaña visual", rot: -2, depth: 1.3, floatDur: 5.7, floatDelay: -0.6 },
  { src: "https://picsum.photos/seed/alrit-dragon/600", alt: "Personaje 3D", rot: 2, depth: 0.9, floatDur: 6.4, floatDelay: -3 },
];

const PULL_RADIUS = 260; // px — magnetic field reach
const MAX_PULL = 28; // px — strongest attraction toward cursor
const MAX_PARALLAX = 16; // px — ambient drift across the cluster

export default function MagneticHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const magnetsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

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
          // ambient parallax: whole cluster drifts with the cursor
          tx += ((pointer.x - cx) / rect.width) * MAX_PARALLAX * depth;
          ty += ((pointer.y - cy) / rect.height) * MAX_PARALLAX * depth;

          // magnetic attraction toward the cursor when it's nearby
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

  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <span className="hero__spark" aria-hidden="true" />

      <header className="hero__head">
        <h1 className="hero__title">
          <span className="hero__title-line">Un lugar para mostrar</span>
          <span className="hero__title-line hero__title-line--2">
            tu <span className="hero__title-accent">obra maestra</span>
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
                  <img
                    className="hero__card-img"
                    src={card.src}
                    alt={card.alt}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="hero__lede">
        Diseñamos y construimos experiencias web que se sienten vivas. Cada
        proyecto, una pieza que merece mostrarse.
      </p>

      <div className="hero__actions">
        <button className="hero__btn hero__btn--primary" type="button">
          Contáctame
        </button>
        <button className="hero__btn hero__btn--ghost" type="button">
          Descubre el trabajo
        </button>
      </div>
    </section>
  );
}
