"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addPhase, togglePhase, deletePhase,
  postUpdate, deleteUpdate,
  setIssueStatus, setIssuePriority, deleteIssue,
  adminAddComment,
} from "../../_actions/clients";

type Phase = { id: string; title: string; done: boolean };
type Update = { id: string; body: string; date: string };
type Issue = { id: string; title: string; description: string | null; priority: string; status: string };
type Comment = { id: string; body: string; date: string; author: string };

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export default function ClientPanel({
  project,
  labels,
}: {
  project: { id: string; phases: Phase[]; updates: Update[]; issues: Issue[]; comments: Comment[] };
  labels: { priority: Record<string, string>; status: Record<string, string> };
}) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [phaseTitle, setPhaseTitle] = useState("");
  const [update, setUpdate] = useState("");
  const [comment, setComment] = useState("");

  return (
    <>
      {/* Fases */}
      <div className="adm-panel" style={{ marginTop: "1.25rem" }}>
        <p className="adm-section-title">Fases (avance)</p>
        <div className="adm-rows">
          {project.phases.map((p) => (
            <div key={p.id} className="adm-row" style={{ gridTemplateColumns: "auto 1fr auto" }}>
              <input type="checkbox" checked={p.done} onChange={(e) => togglePhase(p.id, e.target.checked).then(refresh)} />
              <span style={{ textDecoration: p.done ? "line-through" : "none", color: p.done ? "var(--color-muted)" : "inherit" }}>{p.title}</span>
              <button type="button" className="adm-danger__btn" onClick={() => deletePhase(p.id).then(refresh)}>Eliminar</button>
            </div>
          ))}
        </div>
        <div className="adm-sec__add">
          <input className="adm-input" placeholder="Nueva fase…" value={phaseTitle} onChange={(e) => setPhaseTitle(e.target.value)} />
          <button type="button" className="adm-btn" onClick={() => { if (phaseTitle.trim()) addPhase(project.id, phaseTitle).then(() => { setPhaseTitle(""); refresh(); }); }}>Añadir fase</button>
        </div>
      </div>

      {/* Actualizaciones */}
      <div className="adm-panel" style={{ marginTop: "1.25rem" }}>
        <p className="adm-section-title">Actualizaciones</p>
        <div className="portal-form">
          <textarea className="adm-input adm-textarea" rows={2} placeholder="Publicar una actualización de avance…" value={update} onChange={(e) => setUpdate(e.target.value)} />
          <button type="button" className="adm-btn" onClick={() => { if (update.trim()) postUpdate(project.id, update).then(() => { setUpdate(""); refresh(); }); }}>Publicar</button>
        </div>
        <ul className="portal-updates" style={{ marginTop: "1rem" }}>
          {project.updates.map((u) => (
            <li className="portal-update" key={u.id}>
              <span className="portal-update__date">{u.date} · <button type="button" className="adm-danger__btn" style={{ padding: 0, border: 0, background: "none" }} onClick={() => deleteUpdate(u.id).then(refresh)}>eliminar</button></span>
              <p className="portal-update__body">{u.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Issues */}
      <div className="adm-panel" style={{ marginTop: "1.25rem" }}>
        <p className="adm-section-title">Bugs / ajustes</p>
        {project.issues.length === 0 && <p className="adm-row__hint">El cliente aún no ha reportado nada.</p>}
        <ul className="portal-issues">
          {project.issues.map((it) => (
            <li className="portal-issue" key={it.id}>
              <div className="portal-issue__body">
                <span className="portal-issue__title">{it.title}</span>
                {it.description && <p className="portal-issue__desc">{it.description}</p>}
              </div>
              <div className="portal-issue__meta" style={{ alignItems: "center", gap: "0.5rem" }}>
                <select className="adm-input" value={it.priority} onChange={(e) => setIssuePriority(it.id, e.target.value as "LOW" | "MEDIUM" | "HIGH").then(refresh)}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{labels.priority[p]}</option>)}
                </select>
                <select className="adm-input" value={it.status} onChange={(e) => setIssueStatus(it.id, e.target.value as "OPEN" | "IN_PROGRESS" | "RESOLVED").then(refresh)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{labels.status[s]}</option>)}
                </select>
                <button type="button" className="adm-danger__btn" onClick={() => deleteIssue(it.id).then(refresh)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Comentarios */}
      <div className="adm-panel" style={{ marginTop: "1.25rem" }}>
        <p className="adm-section-title">Comentarios</p>
        <ul className="portal-comments">
          {project.comments.map((c) => (
            <li className="portal-comment" key={c.id}>
              <span className="portal-comment__meta">{c.author} · {c.date}</span>
              <p className="portal-comment__body">{c.body}</p>
            </li>
          ))}
        </ul>
        <div className="portal-form">
          <textarea className="adm-input adm-textarea" rows={2} placeholder="Responder al cliente…" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="button" className="adm-btn" onClick={() => { if (comment.trim()) adminAddComment(project.id, comment).then(() => { setComment(""); refresh(); }); }}>Responder</button>
        </div>
      </div>
    </>
  );
}
