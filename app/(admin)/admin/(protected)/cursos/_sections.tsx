"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addSection, updateSection, deleteSection, saveLesson, deleteLesson } from "../../_actions/courses";

type Lesson = {
  id: string;
  title: string;
  videoUrl: string | null;
  content: string | null;
  durationMin: number | null;
  preview: boolean;
};
type Section = { id: string; title: string; lessons: Lesson[] };

function LessonForm({ sectionId, lesson, onDone }: { sectionId: string; lesson?: Lesson; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    await saveLesson(fd);
    setBusy(false);
    if (!lesson) (e.target as HTMLFormElement).reset();
    onDone();
  }
  return (
    <form className="adm-lesson" onSubmit={onSubmit}>
      {lesson && <input type="hidden" name="id" value={lesson.id} />}
      <input type="hidden" name="sectionId" value={sectionId} />
      <div className="adm-form__grid">
        <label className="adm-field"><span className="adm-field__label">Título de la lección</span>
          <input className="adm-input" name="title" defaultValue={lesson?.title ?? ""} /></label>
        <label className="adm-field"><span className="adm-field__label">URL del video (YouTube/Vimeo)</span>
          <input className="adm-input" name="videoUrl" defaultValue={lesson?.videoUrl ?? ""} placeholder="https://youtu.be/..." /></label>
        <label className="adm-field"><span className="adm-field__label">Duración (min)</span>
          <input className="adm-input" name="durationMin" type="number" min={0} defaultValue={lesson?.durationMin ?? ""} /></label>
      </div>
      <label className="adm-field" style={{ marginTop: "0.6rem" }}><span className="adm-field__label">Contenido (texto, opcional)</span>
        <textarea className="adm-input adm-textarea" name="content" rows={3} defaultValue={lesson?.content ?? ""} /></label>
      <label className="adm-check"><input type="checkbox" name="preview" defaultChecked={lesson?.preview ?? false} /> Vista previa (sin inscripción)</label>
      <div className="adm-actions">
        <button className="adm-btn" type="submit" disabled={busy}>{busy ? "Guardando…" : lesson ? "Guardar lección" : "Agregar lección"}</button>
      </div>
    </form>
  );
}

export default function SectionsManager({ courseId, sections }: { courseId: string; sections: Section[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [newSection, setNewSection] = useState("");

  return (
    <div className="adm-panel" style={{ marginTop: "1.25rem" }}>
      <p className="adm-section-title">Temario</p>

      {sections.length === 0 && <p className="adm-row__hint">Sin secciones todavía.</p>}

      {sections.map((s) => (
        <div className="adm-sec" key={s.id}>
          <div className="adm-sec__head">
            <input
              className="adm-input"
              defaultValue={s.title}
              onBlur={(e) => { if (e.target.value.trim() !== s.title) { updateSection(s.id, e.target.value).then(refresh); } }}
            />
            <button type="button" className="adm-danger__btn" onClick={() => deleteSection(s.id).then(refresh)}>Eliminar sección</button>
          </div>

          {s.lessons.map((l) => (
            <details className="adm-lessonrow" key={l.id}>
              <summary>{l.title} {l.preview && <em className="mega-tag">preview</em>}</summary>
              <LessonForm sectionId={s.id} lesson={l} onDone={refresh} />
              <button type="button" className="adm-danger__btn" onClick={() => deleteLesson(l.id).then(refresh)}>Eliminar lección</button>
            </details>
          ))}

          <details className="adm-lessonrow adm-lessonrow--add">
            <summary>+ Agregar lección</summary>
            <LessonForm sectionId={s.id} onDone={refresh} />
          </details>
        </div>
      ))}

      <div className="adm-sec__add">
        <input className="adm-input" placeholder="Nueva sección…" value={newSection} onChange={(e) => setNewSection(e.target.value)} />
        <button type="button" className="adm-btn" onClick={() => { if (newSection.trim()) addSection(courseId, newSection).then(() => { setNewSection(""); refresh(); }); }}>
          Agregar sección
        </button>
      </div>
    </div>
  );
}
