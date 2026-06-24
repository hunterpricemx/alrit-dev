"use client";

import { useActionState } from "react";
import { savePricing, type PricingState } from "../../_actions/pricing";
import { EXTRA_IDS, type Pricing } from "@/lib/pricing";

export default function PricingForm({
  pricing,
  typeLabels,
  extraLabels,
}: {
  pricing: Pricing;
  typeLabels: Record<string, string>;
  extraLabels: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<PricingState, FormData>(
    savePricing,
    { ok: false },
  );

  return (
    <form action={formAction} className="adm-panel">
      <p className="adm-section-title">Tipos de proyecto (precio base en MXN · tiempo)</p>
      <div className="adm-rows">
        {pricing.types.map((pt) => (
          <div key={pt.id} className="adm-row">
            <div>
              <div className="adm-row__label">{typeLabels[pt.id] ?? pt.id}</div>
              <div className="adm-row__hint">{pt.id}</div>
            </div>
            <input
              className="adm-input"
              name={`type_${pt.id}_base`}
              type="number"
              min={0}
              step={500}
              defaultValue={pt.base ?? ""}
              placeholder="A medida"
            />
            <input
              className="adm-input"
              name={`type_${pt.id}_weeks`}
              defaultValue={pt.weeks ?? ""}
              placeholder="ej. 2 a 3 semanas"
            />
          </div>
        ))}
      </div>

      <p className="adm-section-title" style={{ marginTop: "1.75rem" }}>
        Extras (precio en MXN)
      </p>
      <div className="adm-rows">
        {EXTRA_IDS.map((id) => (
          <div key={id} className="adm-row">
            <div>
              <div className="adm-row__label">{extraLabels[id] ?? id}</div>
              <div className="adm-row__hint">{id}</div>
            </div>
            <input
              className="adm-input"
              name={`extra_${id}`}
              type="number"
              min={0}
              step={500}
              defaultValue={pricing.extras[id]}
            />
            <span aria-hidden="true" />
          </div>
        ))}
      </div>

      <div className="adm-actions">
        <button className="adm-btn" type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {state.ok && <span className="adm-ok">Guardado ✓</span>}
        {state.error && <span className="adm-err">{state.error}</span>}
      </div>
    </form>
  );
}
