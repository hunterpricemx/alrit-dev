"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SlotDef, SlotMap, SlotGroup } from "@/lib/slots";
import { resolveSlot } from "@/lib/slots";
import { assignSlot, clearSlot, deleteMedia } from "../../_actions/media";

type MediaItem = { id: string; url: string; filename: string; mime: string; width: number | null; height: number | null };

const GROUP_LABEL: Record<SlotGroup, string> = {
  mockup: "Mockups de servicio",
  brand: "Logos de marcas",
  tech: "Logos de tecnología",
};

export default function MediaManager({
  media,
  slotMap,
  assignments,
  slots,
}: {
  media: MediaItem[];
  slotMap: SlotMap;
  assignments: Record<string, string>;
  slots: SlotDef[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Error al subir");
      else router.refresh();
    } catch {
      setError("Error de red al subir");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onAssign(slot: string, mediaId: string) {
    setBusy(true);
    if (mediaId) await assignSlot(slot, mediaId);
    else await clearSlot(slot);
    setBusy(false);
    router.refresh();
  }

  async function onDelete(id: string) {
    setBusy(true);
    const r = await deleteMedia(id);
    setBusy(false);
    if (!r.ok) setError(r.error ?? "No se pudo borrar");
    else router.refresh();
  }

  const groups: SlotGroup[] = ["mockup", "brand", "tech"];

  return (
    <div className="adm-media">
      {/* Subida */}
      <div className="adm-panel">
        <p className="adm-section-title">Subir imagen</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={onUpload}
          disabled={busy}
        />
        {busy && <span className="adm-row__hint" style={{ marginLeft: "0.75rem" }}>Procesando…</span>}
        {error && <p className="adm-err">{error}</p>}
      </div>

      {/* Asignación a slots */}
      {groups.map((g) => (
        <div className="adm-panel" key={g} style={{ marginTop: "1.25rem" }}>
          <p className="adm-section-title">{GROUP_LABEL[g]}</p>
          <div className="adm-slots">
            {slots.filter((s) => s.group === g).map((s) => (
              <div className="adm-slot" key={s.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="adm-slot__img" src={resolveSlot(slotMap, s.id, s.fallback)} alt="" />
                <div className="adm-slot__body">
                  <span className="adm-slot__label">{s.label}</span>
                  <select
                    className="adm-input"
                    value={assignments[s.id] ?? ""}
                    onChange={(e) => onAssign(s.id, e.target.value)}
                    disabled={busy}
                  >
                    <option value="">— Imagen por defecto —</option>
                    {media.map((m) => (
                      <option key={m.id} value={m.id}>{m.filename}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Biblioteca */}
      <div className="adm-panel" style={{ marginTop: "1.25rem" }}>
        <p className="adm-section-title">Biblioteca ({media.length})</p>
        {media.length === 0 ? (
          <p className="adm-row__hint">Aún no has subido imágenes.</p>
        ) : (
          <div className="adm-gallery">
            {media.map((m) => (
              <figure className="adm-gallery__item" key={m.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.filename} />
                <figcaption>{m.filename}</figcaption>
                <button type="button" className="adm-gallery__del" onClick={() => onDelete(m.id)} disabled={busy}>
                  Borrar
                </button>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
