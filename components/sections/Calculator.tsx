"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import {
  PROJECT_TYPES,
  SIZE_MULTIPLIERS,
  EXTRAS,
  estimate,
  formatMXN,
  type ProjectTypeId,
  type SizeId,
  type ExtraId,
} from "@/lib/pricing";

const SIZES = Object.keys(SIZE_MULTIPLIERS) as SizeId[];
const EXTRA_IDS = Object.keys(EXTRAS) as ExtraId[];

type StepKey = "type" | "size" | "extras" | "result" | "contact";

/** Animated count-up for the estimate. */
function AnimatedPrice({ amount }: { amount: number }) {
  const [shown, setShown] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const from = ref.current;
    const start = performance.now();
    const dur = reduced ? 1 : 700;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (amount - from) * eased);
      setShown(val);
      ref.current = val;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [amount]);
  return <>{formatMXN(shown)}</>;
}

export default function Calculator({ dict }: { dict: Dictionary }) {
  const t = dict.calculator;
  const w = t.wizard;

  const [type, setType] = useState<ProjectTypeId | null>(null);
  const [size, setSize] = useState<SizeId | null>(null);
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);

  const isCustom = type === "custom";
  const flow: StepKey[] = isCustom
    ? ["type", "contact"]
    : ["type", "size", "extras", "result"];
  const current = flow[Math.min(step, flow.length - 1)];
  const total = flow.length;

  const result = useMemo(
    () => (type && size ? estimate(type, size, extras) : null),
    [type, size, extras]
  );

  const toggleExtra = (id: ExtraId) =>
    setExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  const chooseType = (id: ProjectTypeId) => {
    setType(id);
    setStep(1);
  };
  const chooseSize = (id: SizeId) => {
    setSize(id);
    setStep(2);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const restart = () => {
    setType(null);
    setSize(null);
    setExtras([]);
    setSent(false);
    setStep(0);
  };

  const progress = (step + 1) / total;

  return (
    <section className="calc" id="calculator">
      <div className="calc__inner">
        <div className="calc__head">
          <p className="calc__eyebrow">{t.eyebrow}</p>
          <h2 className="calc__title">{t.title}</h2>
          <p className="calc__subtitle">{t.subtitle}</p>
        </div>

        <div className="calc__panel calc-wizard">
          <div className="calc-wizard__progress">
            <span className="calc-wizard__count">
              {w.step} {Math.min(step + 1, total)} {w.of} {total}
            </span>
            <span className="calc-wizard__track">
              <span
                className="calc-wizard__bar"
                style={{ "--p": progress } as React.CSSProperties}
              />
            </span>
          </div>

          <div className="calc-wizard__stage" key={current}>
            {current === "type" && (
              <div className="calc-step">
                <h3 className="calc-step__q">{w.typeQuestion}</h3>
                <div className="calc-step__grid">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      className={`calc-option${type === pt.id ? " calc-option--active" : ""}`}
                      onClick={() => chooseType(pt.id)}
                    >
                      <span className="calc-option__label">{t.types[pt.id]}</span>
                      <span className="calc-option__hint">
                        {pt.base === null ? t.customTitle : `${t.fromLabel} ${formatMXN(pt.base)}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {current === "size" && (
              <div className="calc-step">
                <h3 className="calc-step__q">{w.sizeQuestion}</h3>
                <div className="calc-step__grid calc-step__grid--3">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`calc-option calc-option--center${size === s ? " calc-option--active" : ""}`}
                      onClick={() => chooseSize(s)}
                    >
                      <span className="calc-option__label">{t.sizes[s]}</span>
                      <span className="calc-option__hint">×{SIZE_MULTIPLIERS[s]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {current === "extras" && (
              <div className="calc-step">
                <h3 className="calc-step__q">{w.extrasQuestion}</h3>
                <p className="calc-step__hint">{w.extrasHint}</p>
                <div className="calc-step__grid">
                  {EXTRA_IDS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={`calc-option calc-option--toggle${extras.includes(id) ? " calc-option--active" : ""}`}
                      onClick={() => toggleExtra(id)}
                      aria-pressed={extras.includes(id)}
                    >
                      <span className="calc-option__label">{t.extras[id]}</span>
                      <span className="calc-option__hint">+ {formatMXN(EXTRAS[id])}</span>
                      <span className="calc-option__check" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {current === "result" && result?.kind === "price" && (
              <div className="calc-step calc-step--result">
                <span className="calc-result__from">{w.resultTitle}</span>
                <strong className="calc-result__price">
                  <AnimatedPrice amount={result.amount} />
                </strong>
                <ul className="calc-result__summary">
                  <li>
                    <span>{t.typeLabel}</span>
                    <strong>{type ? t.types[type] : ""}</strong>
                  </li>
                  <li>
                    <span>{t.sizeLabel}</span>
                    <strong>{size ? t.sizes[size] : ""}</strong>
                  </li>
                  <li>
                    <span>{t.extrasLabel}</span>
                    <strong>
                      {extras.length
                        ? extras.map((e) => t.extras[e]).join(", ")
                        : w.noExtras}
                    </strong>
                  </li>
                </ul>
                <p className="calc__disclaimer">{t.disclaimer}</p>
                <a href="#contacto" className="calc__cta">
                  {t.requestCta}
                </a>
              </div>
            )}

            {current === "contact" &&
              (sent ? (
                <div className="calc-step calc-step--sent">
                  <strong className="calc__sent">{t.form.sent}</strong>
                </div>
              ) : (
                <form
                  className="calc-step calc__form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <h3 className="calc__custom-title">{t.customTitle}</h3>
                  <p className="calc__custom-text">{t.customText}</p>
                  <input className="calc__input" name="name" placeholder={t.form.name} required />
                  <input className="calc__input" type="email" name="email" placeholder={t.form.email} required />
                  <input className="calc__input" name="phone" placeholder={t.form.phone} />
                  <textarea className="calc__input calc__textarea" name="brief" placeholder={t.form.brief} rows={3} />
                  <button type="submit" className="calc__cta">
                    {t.form.submit}
                  </button>
                </form>
              ))}
          </div>

          <div className="calc-wizard__nav">
            {step > 0 && !sent && (
              <button type="button" className="calc-wizard__back" onClick={back}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
                {w.back}
              </button>
            )}

            <span className="calc-wizard__spacer" />

            {current === "extras" && (
              <button type="button" className="calc-wizard__next" onClick={() => setStep(3)}>
                {w.next}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            )}

            {(current === "result" || sent) && (
              <button type="button" className="calc-wizard__restart" onClick={restart}>
                {w.restart}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
