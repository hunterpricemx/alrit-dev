"use client";

import { useState } from "react";

type Faq = { q: string; a: string };

export default function FaqAccordion({ items, defaultOpen = 0 }: { items: Faq[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <ul className="faq">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={i} className={`faq__item${isOpen ? " faq__item--open" : ""}`}>
            <button
              type="button"
              className="faq__q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{f.q}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <div className="faq__a" hidden={!isOpen}>
              <p>{f.a}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
