"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientProject, type ClientProjectState } from "../../_actions/clients";

export default function NewClientForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<ClientProjectState, FormData>(createClientProject, { ok: false });

  useEffect(() => {
    if (state.ok && state.id) router.push(`/admin/clientes/${state.id}`);
  }, [state, router]);

  return (
    <form action={action} className="adm-panel">
      <p className="adm-section-title">Cuenta del cliente</p>
      <div className="adm-form__grid">
        <label className="adm-field"><span className="adm-field__label">Nombre del cliente</span>
          <input className="adm-input" name="clientName" /></label>
        <label className="adm-field"><span className="adm-field__label">Email</span>
          <input className="adm-input" name="clientEmail" type="email" /></label>
        <label className="adm-field"><span className="adm-field__label">Contraseña (mín. 8)</span>
          <input className="adm-input" name="clientPassword" type="text" /></label>
      </div>
      <p className="adm-row__hint">Si el email ya existe, se reutiliza esa cuenta. Entrégale estas credenciales al cliente.</p>

      <p className="adm-section-title" style={{ marginTop: "1.5rem" }}>Proyecto</p>
      <label className="adm-field"><span className="adm-field__label">Nombre del proyecto</span>
        <input className="adm-input" name="projectName" /></label>
      <label className="adm-field" style={{ marginTop: "0.75rem" }}><span className="adm-field__label">Resumen (opcional)</span>
        <textarea className="adm-input adm-textarea" name="summary" rows={3} /></label>

      <div className="adm-actions">
        <button className="adm-btn" type="submit" disabled={pending}>{pending ? "Creando…" : "Crear cliente y proyecto"}</button>
        <Link href="/admin/clientes" className="adm-btn adm-btn--ghost">Volver</Link>
        {state.error && <span className="adm-err">{state.error}</span>}
      </div>
    </form>
  );
}
