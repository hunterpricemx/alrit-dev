"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { savePost, type PostFormState } from "../../_actions/blog";
import { BLOG_CATEGORIES } from "@/lib/content/blog-categories";

export type PostInitial = {
  id: string;
  slug: string;
  category: string;
  cover: string;
  author: string;
  publishedAt: string;
  published: boolean;
  es_title: string;
  es_excerpt: string;
  es_body: string;
  en_title: string;
  en_excerpt: string;
  en_body: string;
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

export default function PostForm({ initial, media, isNew }: { initial: PostInitial; media: MediaItem[]; isNew: boolean }) {
  const [state, formAction, pending] = useActionState<PostFormState, FormData>(savePost, { ok: false });
  const [cover, setCover] = useState(initial.cover);

  return (
    <form action={formAction} className="adm-panel adm-form">
      <input type="hidden" name="id" defaultValue={initial.id} />
      <div className="adm-form__grid">
        <Field label="Slug (URL)" name="slug" defaultValue={initial.slug} hint="minúsculas-con-guiones" />
        <label className="adm-field">
          <span className="adm-field__label">Categoría</span>
          <select className="adm-input" name="category" defaultValue={initial.category || BLOG_CATEGORIES[0].key}>
            {BLOG_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.es}</option>)}
          </select>
        </label>
        <Field label="Autor" name="author" defaultValue={initial.author} />
        <Field label="Fecha de publicación" name="publishedAt" defaultValue={initial.publishedAt} hint="AAAA-MM-DD" />
        <div className="adm-field">
          <span className="adm-field__label">Portada</span>
          <input className="adm-input" name="cover" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="/ruta o URL" />
          {media.length > 0 && (
            <select className="adm-input" value="" onChange={(e) => e.target.value && setCover(e.target.value)}>
              <option value="">— biblioteca —</option>
              {media.map((m) => <option key={m.id} value={m.url}>{m.filename}</option>)}
            </select>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {cover && <img className="adm-slot__img" src={cover} alt="" />}
        </div>
      </div>

      <div className="adm-form__cols">
        <fieldset className="adm-fieldset">
          <legend>Español</legend>
          <Field label="Título" name="es_title" defaultValue={initial.es_title} />
          <Field label="Extracto" name="es_excerpt" defaultValue={initial.es_excerpt} />
          <label className="adm-field">
            <span className="adm-field__label">Cuerpo (Markdown)</span>
            <textarea className="adm-input adm-textarea" name="es_body" rows={16} defaultValue={initial.es_body} />
          </label>
        </fieldset>
        <fieldset className="adm-fieldset">
          <legend>English</legend>
          <Field label="Title" name="en_title" defaultValue={initial.en_title} />
          <Field label="Excerpt" name="en_excerpt" defaultValue={initial.en_excerpt} />
          <label className="adm-field">
            <span className="adm-field__label">Body (Markdown)</span>
            <textarea className="adm-input adm-textarea" name="en_body" rows={16} defaultValue={initial.en_body} />
          </label>
        </fieldset>
      </div>

      <label className="adm-check">
        <input type="checkbox" name="published" defaultChecked={initial.published} /> Publicado
      </label>

      <div className="adm-actions">
        <button className="adm-btn" type="submit" disabled={pending}>{pending ? "Guardando…" : isNew ? "Crear" : "Guardar cambios"}</button>
        <Link href="/admin/blog" className="adm-btn adm-btn--ghost">Volver</Link>
        {state.ok && <span className="adm-ok">Guardado ✓</span>}
        {state.error && <span className="adm-err">{state.error}</span>}
      </div>
    </form>
  );
}
