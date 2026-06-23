"use client";

import { useMemo, useState } from "react";
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

export default function Calculator({ dict }: { dict: Dictionary }) {
  const t = dict.calculator;
  const [type, setType] = useState<ProjectTypeId>("wordpress");
  const [size, setSize] = useState<SizeId>("medium");
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [sent, setSent] = useState(false);

  const result = useMemo(() => estimate(type, size, extras), [type, size, extras]);

  const toggleExtra = (id: ExtraId) =>
    setExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  return (
    <section className="calc" id="calculator">
      <div className="calc__inner">
        <div className="calc__head">
          <p className="calc__eyebrow">{t.eyebrow}</p>
          <h2 className="calc__title">{t.title}</h2>
          <p className="calc__subtitle">{t.subtitle}</p>
        </div>

        <div className="calc__panel">
          <div className="calc__controls">
            {/* Tipo de proyecto */}
            <fieldset className="calc__field">
              <legend className="calc__label">{t.typeLabel}</legend>
              <div className="calc__chips">
                {PROJECT_TYPES.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    className={`calc__chip${type === pt.id ? " calc__chip--active" : ""}`}
                    onClick={() => setType(pt.id)}
                    aria-pressed={type === pt.id}
                  >
                    {t.types[pt.id]}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Tamaño + extras (solo si NO es a medida) */}
            {result.kind === "price" && (
              <>
                <fieldset className="calc__field">
                  <legend className="calc__label">{t.sizeLabel}</legend>
                  <div className="calc__segment">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`calc__seg${size === s ? " calc__seg--active" : ""}`}
                        onClick={() => setSize(s)}
                        aria-pressed={size === s}
                      >
                        {t.sizes[s]}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="calc__field">
                  <legend className="calc__label">{t.extrasLabel}</legend>
                  <div className="calc__chips">
                    {EXTRA_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={`calc__chip${extras.includes(id) ? " calc__chip--active" : ""}`}
                        onClick={() => toggleExtra(id)}
                        aria-pressed={extras.includes(id)}
                      >
                        {t.extras[id]}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
          </div>

          {/* Resultado */}
          <aside className="calc__result" aria-live="polite">
            {result.kind === "price" ? (
              <div className="calc__price-box">
                <span className="calc__from">{t.fromLabel}</span>
                <strong className="calc__price">{formatMXN(result.amount)}</strong>
                <p className="calc__disclaimer">{t.disclaimer}</p>
                <a href="#contacto" className="calc__cta">
                  {t.requestCta}
                </a>
              </div>
            ) : sent ? (
              <div className="calc__price-box calc__price-box--sent">
                <strong className="calc__sent">{t.form.sent}</strong>
              </div>
            ) : (
              <form
                className="calc__form"
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
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
