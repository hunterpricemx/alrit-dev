"use client";

import { useRef } from "react";

type TiltProps = {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees. */
  max?: number;
};

/**
 * Subtle pointer-driven 3D tilt — echoes the magnetic hero across card grids.
 * Sets --rx / --ry / --tz custom properties consumed by the `.tilt` CSS.
 */
export default function Tilt({ children, className = "", max = 7 }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (reduced.current) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
    el.style.setProperty("--tz", "10px");
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--tz", "0px");
  };

  const onEnter = () => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  return (
    <div
      ref={ref}
      className={`tilt ${className}`.trim()}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </div>
  );
}
