"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveProject, type ProjectFormState } from "../../_actions/portfolio";

export type ProjectInitial = {
  slug: string;
  image: string;
  imageMobile: string;
  bg: string;
  cat: string;
  relatedService: string;
  url: string;
  status: string;
  industry: string;
  tech: string;
  es_title: string;
  es_short: string;
  es_long: string;
  en_title: string;
  en_short: string;
  en_long: string;
  highlights: string;
  tags: string;
  published: boolean;
  sortOrder: number;
};

type MediaItem = { id: string; url: string; filename: string };

function Field({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue?: string; hint?: string }) {
  return (
    <label className="adm-field">
      <span className="adm-field__label">{label}{hint && <em className="adm-field__hint"> · {hint}</em>}</span>
      <input className="adm-input" name={name} defaultValue={defaultValue} />
    </label>
  );
}

function MediaField({ label, name, defaultValue, media }: { label: string; name: string; defaultValue: string; media: MediaItem[] }) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div className="adm-field">
      <span className="adm-field__label">{label}</span>
      <input className="adm-input" name={name} value={val} onChange={(e) => setVal(e.target.value)} placeholder="/ruta o URL" />
      {media.length > 0 && (
        <select className="adm-input" value="" onChange={(e) => e.target.value && setVal(e.target.value)}>
          <option value="">— elegir de la biblioteca —</option>
          {media.map((m) => <option key={m.id} value={m.url}>{m.filename}</option>)}
        </select>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {val && <img className="adm-slot__img" src={val} alt="" />}
    </div>
  );
}

export default function ProjectForm({
  initial,
  media,
  isNew,
}: {
  initial: ProjectInitial;
  media: MediaItem[];
  isNew: boolean;
}) {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(saveProject, { ok: false });

  return (
    <form action={formAction} className="adm-panel adm-form">
      <div className="adm-form__grid">
        <Field label="Slug (URL)" name="slug" defaultValue={initial.slug} hint="minúsculas-con-guiones" />
        <Field label="Estado" name="status" defaultValue={initial.status} hint="live / wip" />
        <Field label="Categoría" name="cat" defaultValue={initial.cat} hint="webdev, wordpress, lms…" />
        <Field label="Servicio relacionado" name="relatedService" defaultValue={initial.relatedService} />
        <Field label="Color de fondo (bg)" name="bg" defaultValue={initial.bg} hint="#hex" />
        <Field label="URL del sitio" name="url" defaultValue={initial.url} />
        <Field label="Industria" name="industry" defaultValue={initial.industry} />
        <Field label="Tecnología" name="tech" defaultValue={initial.tech} />
        <Field label="Orden" name="sortOrder" defaultValue={String(initial.sortOrder)} />
        <MediaField label="Imagen escritorio" name="image" defaultValue={initial.image} media={media} />
        <MediaField label="Imagen móvil" name="imageMobile" defaultValue={initial.imageMobile} media={media} />
      </div>

      <div className="adm-form__cols">
        <fieldset className="adm-fieldset">
          <legend>Español</legend>
          <Field label="Título" name="es_title" defaultValue={initial.es_title} />
          <Field label="Resumen" name="es_short" defaultValue={initial.es_short} />
          <label className="adm-field">
            <span className="adm-field__label">Descripción larga</span>
            <textarea className="adm-input adm-textarea" name="es_long" rows={5} defaultValue={initial.es_long} />
          </label>
        </fieldset>
        <fieldset className="adm-fieldset">
          <legend>English</legend>
          <Field label="Title" name="en_title" defaultValue={initial.en_title} />
          <Field label="Short" name="en_short" defaultValue={initial.en_short} />
          <label className="adm-field">
            <span className="adm-field__label">Long description</span>
            <textarea className="adm-input adm-textarea" name="en_long" rows={5} defaultValue={initial.en_long} />
          </label>
        </fieldset>
      </div>

      <div className="adm-form__cols">
        <label className="adm-field">
          <span className="adm-field__label">Highlights (uno por línea)</span>
          <textarea className="adm-input adm-textarea" name="highlights" rows={5} defaultValue={initial.highlights} />
        </label>
        <label className="adm-field">
          <span className="adm-field__label">Tags (uno por línea)</span>
          <textarea className="adm-input adm-textarea" name="tags" rows={5} defaultValue={initial.tags} />
        </label>
      </div>

      <label className="adm-check">
        <input type="checkbox" name="published" defaultChecked={initial.published} /> Publicado
      </label>

      <div className="adm-actions">
        <button className="adm-btn" type="submit" disabled={pending}>
          {pending ? "Guardando…" : isNew ? "Crear proyecto" : "Guardar cambios"}
        </button>
        <Link href="/admin/portfolio" className="adm-btn adm-btn--ghost">Volver</Link>
        {state.ok && <span className="adm-ok">Guardado ✓</span>}
        {state.error && <span className="adm-err">{state.error}</span>}
      </div>
    </form>
  );
}
