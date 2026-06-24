"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveCourse, type CourseState } from "../../_actions/courses";

export type CourseInitial = {
  id?: string;
  slug: string;
  language: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string;
  level: string;
  priceCents: number;
  published: boolean;
  sortOrder: number;
};

export default function CourseForm({ initial, isNew }: { initial: CourseInitial; isNew: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<CourseState, FormData>(saveCourse, { ok: false });

  useEffect(() => {
    if (state.ok && isNew && state.id) router.push(`/admin/cursos/${state.id}`);
  }, [state, isNew, router]);

  return (
    <form action={action} className="adm-panel">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="adm-form__grid">
        <label className="adm-field"><span className="adm-field__label">Slug (URL)</span>
          <input className="adm-input" name="slug" defaultValue={initial.slug} /></label>
        <label className="adm-field"><span className="adm-field__label">Idioma</span>
          <select className="adm-input" name="language" defaultValue={initial.language}>
            <option value="es">Español</option><option value="en">English</option>
          </select></label>
        <label className="adm-field"><span className="adm-field__label">Título</span>
          <input className="adm-input" name="title" defaultValue={initial.title} /></label>
        <label className="adm-field"><span className="adm-field__label">Nivel</span>
          <input className="adm-input" name="level" defaultValue={initial.level} /></label>
        <label className="adm-field"><span className="adm-field__label">Precio (centavos MXN, 0 = gratis)</span>
          <input className="adm-input" name="priceCents" type="number" min={0} defaultValue={initial.priceCents} /></label>
        <label className="adm-field"><span className="adm-field__label">Orden</span>
          <input className="adm-input" name="sortOrder" type="number" defaultValue={initial.sortOrder} /></label>
        <label className="adm-field"><span className="adm-field__label">Imagen de portada (URL)</span>
          <input className="adm-input" name="coverImage" defaultValue={initial.coverImage} placeholder="/ruta o URL" /></label>
      </div>
      <label className="adm-field" style={{ marginTop: "1rem" }}><span className="adm-field__label">Resumen</span>
        <textarea className="adm-input adm-textarea" name="summary" rows={2} defaultValue={initial.summary} /></label>
      <label className="adm-field" style={{ marginTop: "1rem" }}><span className="adm-field__label">Descripción</span>
        <textarea className="adm-input adm-textarea" name="description" rows={5} defaultValue={initial.description} /></label>
      <label className="adm-check"><input type="checkbox" name="published" defaultChecked={initial.published} /> Publicado</label>

      <div className="adm-actions">
        <button className="adm-btn" type="submit" disabled={pending}>
          {pending ? "Guardando…" : isNew ? "Crear curso" : "Guardar curso"}
        </button>
        <Link href="/admin/cursos" className="adm-btn adm-btn--ghost">Volver</Link>
        {state.ok && !isNew && <span className="adm-ok">Guardado ✓</span>}
        {state.error && <span className="adm-err">{state.error}</span>}
      </div>
    </form>
  );
}
