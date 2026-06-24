"use client";

import { useActionState } from "react";
import { saveTextOverrides, type TextState } from "../../_actions/text";
import type { EditableKey } from "@/lib/i18n/overrides";

export default function TextForm({
  fields,
  base,
  overrides,
  locales,
}: {
  fields: EditableKey[];
  base: Record<string, string>;
  overrides: Record<string, string>;
  locales: string[];
}) {
  const [state, action, pending] = useActionState<TextState, FormData>(saveTextOverrides, { ok: false });
  const groups = [...new Set(fields.map((f) => f.group))];

  return (
    <form action={action}>
      {groups.map((g) => (
        <div className="adm-panel" key={g} style={{ marginBottom: "1.25rem" }}>
          <p className="adm-section-title">{g}</p>
          {fields.filter((f) => f.group === g).map((f) => (
            <div className="adm-textrow" key={f.key}>
              <div className="adm-textrow__label">
                {f.label}
                <span className="adm-row__hint">{f.key}</span>
              </div>
              <div className="adm-textrow__inputs">
                {locales.map((loc) => {
                  const name = `${loc}__${f.key}`;
                  const ph = `${loc.toUpperCase()}: ${base[name] ?? ""}`;
                  return f.multiline ? (
                    <textarea key={loc} className="adm-input adm-textarea" name={name} rows={3} defaultValue={overrides[name] ?? ""} placeholder={ph} />
                  ) : (
                    <input key={loc} className="adm-input" name={name} defaultValue={overrides[name] ?? ""} placeholder={ph} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="adm-actions">
        <button className="adm-btn" type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar textos"}
        </button>
        {state.ok && <span className="adm-ok">Guardado ✓</span>}
        {state.error && <span className="adm-err">{state.error}</span>}
      </div>
    </form>
  );
}
