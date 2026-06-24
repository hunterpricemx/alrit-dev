"use client";

import { useActionState } from "react";
import { saveProject, type ClientProjectState } from "../../_actions/clients";

export default function ProjectForm({
  initial,
}: {
  initial: { id: string; name: string; summary: string; status: string };
}) {
  const [state, action, pending] = useActionState<ClientProjectState, FormData>(saveProject, { ok: false });

  return (
    <form action={action} className="adm-panel">
      <input type="hidden" name="id" value={initial.id} />
      <div className="adm-form__grid">
        <label className="adm-field"><span className="adm-field__label">Nombre del proyecto</span>
          <input className="adm-input" name="name" defaultValue={initial.name} /></label>
        <label className="adm-field"><span className="adm-field__label">Estado</span>
          <input className="adm-input" name="status" defaultValue={initial.status} /></label>
      </div>
      <label className="adm-field" style={{ marginTop: "0.75rem" }}><span className="adm-field__label">Resumen</span>
        <textarea className="adm-input adm-textarea" name="summary" rows={3} defaultValue={initial.summary} /></label>
      <div className="adm-actions">
        <button className="adm-btn" type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</button>
        {state.ok && <span className="adm-ok">Guardado ✓</span>}
        {state.error && <span className="adm-err">{state.error}</span>}
      </div>
    </form>
  );
}
