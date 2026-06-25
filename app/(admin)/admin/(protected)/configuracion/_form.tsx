"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsFormState } from "../../_actions/settings";
import type { SiteSettings } from "@/lib/content/settings";

function Field({ label, name, defaultValue, hint, placeholder }: { label: string; name: string; defaultValue?: string; hint?: string; placeholder?: string }) {
  return (
    <label className="adm-field">
      <span className="adm-field__label">{label}{hint && <em className="adm-field__hint"> · {hint}</em>}</span>
      <input className="adm-input" name={name} defaultValue={defaultValue} placeholder={placeholder} />
    </label>
  );
}

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(saveSettings, { ok: false });

  return (
    <form action={formAction} className="adm-panel adm-form">
      <fieldset className="adm-fieldset">
        <legend>Contacto</legend>
        <div className="adm-form__grid">
          <Field label="Email" name="email" defaultValue={initial.email} placeholder="hola@alrit.dev" />
          <Field label="WhatsApp" name="whatsapp" defaultValue={initial.whatsapp} hint="solo dígitos, con país" placeholder="5215512345678" />
          <Field label="Teléfono" name="phone" defaultValue={initial.phone} hint="E.164" placeholder="+52 55 1234 5678" />
        </div>
      </fieldset>

      <fieldset className="adm-fieldset">
        <legend>Redes sociales (sameAs)</legend>
        <div className="adm-form__grid">
          <Field label="Instagram" name="instagram" defaultValue={initial.instagram} placeholder="https://instagram.com/…" />
          <Field label="LinkedIn" name="linkedin" defaultValue={initial.linkedin} placeholder="https://linkedin.com/company/…" />
          <Field label="GitHub" name="github" defaultValue={initial.github} placeholder="https://github.com/…" />
          <Field label="Facebook" name="facebook" defaultValue={initial.facebook} placeholder="https://facebook.com/…" />
          <Field label="X / Twitter" name="x" defaultValue={initial.x} placeholder="https://x.com/…" />
        </div>
      </fieldset>

      <fieldset className="adm-fieldset">
        <legend>Analítica y negocio</legend>
        <div className="adm-form__grid">
          <Field label="GA4 Measurement ID" name="gaId" defaultValue={initial.gaId} hint="activa la analítica" placeholder="G-XXXXXXXXXX" />
          <Field label="Rango de precio" name="priceRange" defaultValue={initial.priceRange} hint="schema" placeholder="$$" />
        </div>
      </fieldset>

      <fieldset className="adm-fieldset">
        <legend>Dirección (SEO local — opcional)</legend>
        <div className="adm-form__grid">
          <Field label="Calle y número" name="streetAddress" defaultValue={initial.streetAddress} />
          <Field label="Ciudad" name="addressLocality" defaultValue={initial.addressLocality} placeholder="Ciudad de México" />
          <Field label="Estado" name="addressRegion" defaultValue={initial.addressRegion} placeholder="CDMX" />
          <Field label="Código postal" name="postalCode" defaultValue={initial.postalCode} />
          <Field label="País" name="addressCountry" defaultValue={initial.addressCountry} hint="ISO-2" placeholder="MX" />
        </div>
      </fieldset>

      <div className="adm-actions">
        <button className="adm-btn" type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar configuración"}</button>
        {state.ok && <span className="adm-ok">Guardado ✓</span>}
        {state.error && <span className="adm-err">{state.error}</span>}
      </div>
    </form>
  );
}
