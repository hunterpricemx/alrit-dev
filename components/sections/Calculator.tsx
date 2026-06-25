"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import {
  EXTRA_IDS,
  getTypeFrom,
  estimateFrom,
  formatMXN,
  type Pricing,
  type ProjectTypeId,
  type ExtraId,
} from "@/lib/pricing";
import { resolveSlot, mockupSlot, type SlotMap } from "@/lib/slots";
import { submitQuote } from "@/app/(site)/[locale]/_actions/quote";
import { trackEvent } from "@/lib/analytics";

const GRID_ORDER: ProjectTypeId[] = ["landing", "ecommerce", "lms", "realestate", "custom", "mobile"];

const META: Record<ProjectTypeId, { accent: string; image: string; icon: string }> = {
  landing: { accent: "#8a6bff", image: "/hero/sass.png", icon: "M3 3v18h18M7 16v-5M12 16V8M17 16v-9" },
  ecommerce: { accent: "#ff5e57", image: "/hero/ecommerce.png", icon: "M5 7h14l-1.2 9.5a2 2 0 0 1-2 1.5H8.2a2 2 0 0 1-2-1.5L5 7Zm3 0a4 4 0 0 1 8 0" },
  lms: { accent: "#8a6bff", image: "/hero/lms.png", icon: "M3 7l9-4 9 4-9 4-9-4Zm3 2v5c0 1.7 2.7 3 6 3s6-1.3 6-3V9" },
  realestate: { accent: "#00b894", image: "/hero/realstate.png", icon: "M4 11 12 4l8 7M6 10v9h12v-9M10 19v-5h4v5" },
  custom: { accent: "#fb8c2e", image: "/hero/sass.png", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  mobile: { accent: "#3b82f6", image: "/hero/app.png", icon: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 15h2" },
};

function AnimatedPrice({ amount }: { amount: number }) {
  const [shown, setShown] = useState(amount);
  const ref = useRef(amount);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const from = ref.current;
    const start = performance.now();
    const dur = reduced ? 1 : 600;
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

export default function Calculator({ dict, pricing, slotMap }: { dict: Dictionary; pricing: Pricing; slotMap?: SlotMap }) {
  const t = dict.calculator;
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ProjectTypeId>("landing");
  const [extras, setExtras] = useState<ExtraId[]>([]);

  const meta = META[type];
  const typeInfo = getTypeFrom(pricing.types, type);
  const isCustom = typeInfo?.base === null;
  const est = useMemo(() => estimateFrom(pricing, type, extras), [pricing, type, extras]);

  const toggleExtra = (id: ExtraId) =>
    setExtras((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const goNext = () => setStep((s) => Math.min(3, s + 1));

  const handleQuoteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await submitQuote({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        brief: String(fd.get("brief") ?? ""),
        projectType: type,
        extras,
        amount: est.kind === "price" ? est.amount : null,
        custom: est.kind === "custom",
      });
      trackEvent("generate_lead", {
        currency: "MXN",
        value: est.kind === "price" ? est.amount : 0,
        project_type: type,
      });
    } catch {
      // best-effort: igual mostramos la pantalla de "listo"
    }
    goNext();
  };
  const restart = () => {
    setStep(0);
    setType("landing");
    setExtras([]);
  };

  const stepTitles = [t.step1Title, t.step2Title, t.step3Title, t.doneTitle];
  const stepSubs = [t.step1Sub, t.step2Sub, t.step3Sub, t.doneSub];

  return (
    <section className="calc" id="calculator">
      <div className="calc__head">
        <p className="calc__eyebrow">{t.eyebrow}</p>
        <h2 className="calc__title">
          {t.titleA} <span className="calc__title-accent">{t.titleAccent}</span>
        </h2>
        <p className="calc__sub">{t.subtitle}</p>
      </div>

      {/* Stepper */}
      <ol className="calc__stepper">
        {t.steps.map((s, i) => (
          <li key={i} className={`cstep${i === step ? " cstep--active" : ""}${i < step ? " cstep--done" : ""}`}>
            <button
              type="button"
              className="cstep__btn"
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
            >
              <span className="cstep__num">{i < step ? "✓" : i + 1}</span>
              <span className="cstep__label">
                <span className="cstep__title">{s.title}</span>
                <span className="cstep__caption">{s.caption}</span>
              </span>
            </button>
            {i < t.steps.length - 1 && <span className="cstep__line" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="calc__layout">
        {/* Main panel */}
        <div className="calc__main">
          <h3 className="calc__step-title">
            {step + 1}. {stepTitles[step]}
          </h3>
          <p className="calc__step-sub">{stepSubs[step]}</p>

          {step === 0 && (
            <div className="calc__types">
              {GRID_ORDER.map((id) => {
                const pt = pricing.types.find((p) => p.id === id)!;
                const m = META[id];
                const info = t.types[id];
                const active = type === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`ctype${active ? " ctype--active" : ""}`}
                    style={{ "--accent": m.accent } as React.CSSProperties}
                    onClick={() => setType(id)}
                    aria-pressed={active}
                  >
                    <span className="ctype__media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolveSlot(slotMap, mockupSlot(id), m.image)} alt="" aria-hidden="true" loading="lazy" draggable={false} />
                      <span className="ctype__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d={m.icon} />
                        </svg>
                      </span>
                    </span>
                    {active && (
                      <span className="ctype__check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l4 4 10-11" />
                        </svg>
                      </span>
                    )}
                    <span className="ctype__name">{info.name}</span>
                    <span className="ctype__desc">{info.desc}</span>
                    <span className="ctype__price">
                      {pt.base !== null ? `${t.fromLabel} ${formatMXN(pt.base)}` : t.customPrice}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 &&
            (isCustom ? (
              <p className="calc__note">{t.step2Custom}</p>
            ) : (
              <div className="calc__feats">
                {EXTRA_IDS.map((id) => {
                  const active = extras.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`cfeat${active ? " cfeat--active" : ""}`}
                      onClick={() => toggleExtra(id)}
                      aria-pressed={active}
                    >
                      <span className="cfeat__check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l4 4 10-11" />
                        </svg>
                      </span>
                      <span className="cfeat__body">
                        <span className="cfeat__name">{t.extras[id]}</span>
                        <span className="cfeat__desc">{t.extrasDesc[id]}</span>
                      </span>
                      <span className="cfeat__price">+ {formatMXN(pricing.extras[id])}</span>
                    </button>
                  );
                })}
              </div>
            ))}

          {step === 2 && (
            <form className="calc__form" onSubmit={handleQuoteSubmit} id="calc-form">
              <input className="calc__input" name="name" placeholder={t.form.name} required />
              <input className="calc__input" type="email" name="email" placeholder={t.form.email} required />
              <input className="calc__input" name="phone" placeholder={t.form.phone} />
              <textarea className="calc__input calc__textarea" name="brief" placeholder={t.form.brief} rows={4} />
            </form>
          )}

          {step === 3 && (
            <div className="calc__done">
              <span className="calc__done-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l4 4 10-11" />
                </svg>
              </span>
              <h4 className="calc__done-title">{t.doneTitle}</h4>
              <p className="calc__done-sub">{t.doneSub}</p>
              <button type="button" className="calc__restart" onClick={restart}>
                {t.restart}
              </button>
            </div>
          )}

          <ul className="calc__badges">
            {t.badges.map((b, i) => (
              <li key={i} className="calc-badge">
                <span className="calc-badge__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path
                      d={
                        i === 0
                          ? "M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"
                          : i === 1
                            ? "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                            : "M3 14v-1a9 9 0 0 1 18 0v1M5 12h1v7H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm14 0h-1v7h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2ZM12 21h3"
                      }
                    />
                  </svg>
                </span>
                <span className="calc-badge__body">
                  <span className="calc-badge__title">{b.title}</span>
                  <span className="calc-badge__text">{b.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Live summary sidebar */}
        <aside className="calc__summary">
          <div className="calc-sum">
            <p className="calc-sum__title">{t.summaryTitle}</p>
            <div className="calc-sum__mockup">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveSlot(slotMap, mockupSlot(type), meta.image)} alt="" aria-hidden="true" />
            </div>
            <div className="calc-sum__type" style={{ "--accent": meta.accent } as React.CSSProperties}>
              <span className="calc-sum__type-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={meta.icon} />
                </svg>
              </span>
              <span className="calc-sum__type-name">{t.types[type].name}</span>
              <button type="button" className="calc-sum__change" onClick={() => setStep(0)}>
                {t.change}
              </button>
            </div>

            <p className="calc-sum__features-label">{t.selectedFeatures}</p>
            <ul className="calc-sum__lines">
              {!isCustom && typeInfo?.base != null && (
                <li>
                  <span className="calc-sum__line-name">
                    <span className="calc-sum__tick" aria-hidden="true" />
                    {t.types[type].short} {t.baseSuffix}
                  </span>
                  <span className="calc-sum__line-price">{formatMXN(typeInfo.base)}</span>
                </li>
              )}
              {!isCustom &&
                extras.map((id) => (
                  <li key={id}>
                    <span className="calc-sum__line-name">
                      <span className="calc-sum__tick" aria-hidden="true" />
                      {t.extras[id]}
                    </span>
                    <span className="calc-sum__line-price">{formatMXN(pricing.extras[id])}</span>
                  </li>
                ))}
              {isCustom && <li className="calc-sum__custom">{t.customPrice}</li>}
              {!isCustom && extras.length === 0 && typeInfo?.base == null && (
                <li className="calc-sum__empty">{t.noFeatures}</li>
              )}
            </ul>

            <div className="calc-sum__total-row">
              <span className="calc-sum__total-label">{t.total}</span>
              <strong className="calc-sum__total">
                {est.kind === "price" ? (
                  <>
                    <AnimatedPrice amount={est.amount} />
                    <span className="calc-sum__cur"> MXN</span>
                  </>
                ) : (
                  <span className="calc-sum__custom-total">{t.customPrice}</span>
                )}
              </strong>
            </div>

            <div className="calc-sum__time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
              </svg>
              {t.time}: {typeInfo?.weeks ?? t.timeCustom}
            </div>

            {step < 3 ? (
              <button
                type={step === 2 ? "submit" : "button"}
                form={step === 2 ? "calc-form" : undefined}
                className="calc-sum__cta"
                onClick={step === 2 ? undefined : goNext}
              >
                {step === 2 ? t.send : t.continue}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            ) : (
              <button type="button" className="calc-sum__cta" onClick={restart}>
                {t.restart}
              </button>
            )}

            {step < 3 && t.nextHints[step] && (
              <p className="calc-sum__next">
                {t.nextLabel}: {t.nextHints[step]}
              </p>
            )}
          </div>

          <div className="calc__social">
            <span className="calc__avatars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={`calc__avatar calc__avatar--${i}`} />
              ))}
            </span>
            <span className="calc__social-text">{t.socialProof}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
