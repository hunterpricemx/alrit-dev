"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SlotDef, SlotMap } from "@/lib/slots";
import { resolveSlot } from "@/lib/slots";
import { assignSlot, clearSlot, deleteMedia } from "../../_actions/media";

type MediaItem = { id: string; url: string; filename: string; mime: string; width: number | null; height: number | null };

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

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
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [libOpen, setLibOpen] = useState(false);

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Error al subir la imagen");
      return null;
    }
    return json.media.id as string;
  }

  async function onReplace(slot: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusySlot(slot);
    setError("");
    const mediaId = await uploadFile(file);
    if (mediaId) {
      await assignSlot(slot, mediaId);
      router.refresh();
    }
    setBusySlot(null);
  }

  async function onRestore(slot: string) {
    setBusySlot(slot);
    setError("");
    await clearSlot(slot);
    router.refresh();
    setBusySlot(null);
  }

  async function onDelete(id: string) {
    setError("");
    const r = await deleteMedia(id);
    if (!r.ok) setError(r.error ?? "No se pudo borrar");
    else router.refresh();
  }

  return (
    <div className="grid gap-6">
      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-red-700">{error}</p>}

      {/* Imágenes principales */}
      <section className="adm-panel">
        <p className="adm-section-title">Imágenes principales</p>
        <p className="mb-4 text-sm text-stone-500">
          Estas imágenes aparecen en el inicio (hero), en las tarjetas de servicio y en la calculadora. Cada una se usa en varios lugares del sitio.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => {
            const custom = Boolean(assignments[s.id]);
            const busy = busySlot === s.id;
            return (
              <div key={s.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <div className="flex h-44 items-center justify-center bg-stone-50 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveSlot(slotMap, s.id, s.fallback)} alt={s.label} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="grid gap-3 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-stone-800">{s.label}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${custom ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}
                    >
                      {custom ? "Personalizada" : "Predeterminada"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label
                      className={`cursor-pointer rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-semibold text-white ${busy ? "opacity-60" : "hover:bg-stone-700"}`}
                    >
                      {busy ? "Subiendo…" : "Cambiar imagen"}
                      <input type="file" accept={ACCEPT} className="hidden" onChange={(e) => onReplace(s.id, e)} disabled={busy} />
                    </label>
                    {custom && (
                      <button
                        type="button"
                        onClick={() => onRestore(s.id)}
                        disabled={busy}
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
                      >
                        Restaurar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Accesos a otras imágenes */}
      <section className="adm-panel">
        <p className="adm-section-title">Otras imágenes del sitio</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/logos"
            className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:border-stone-400"
          >
            <span>
              <span className="block font-semibold text-stone-800">Logos de marcas y tecnologías</span>
              <span className="block text-sm text-stone-500">El carrusel de clientes y el stack de tecnologías.</span>
            </span>
            <span aria-hidden="true" className="text-stone-400">→</span>
          </Link>
          <Link
            href="/admin/portfolio"
            className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:border-stone-400"
          >
            <span>
              <span className="block font-semibold text-stone-800">Imágenes de proyectos</span>
              <span className="block text-sm text-stone-500">Cada proyecto del portafolio tiene su propia imagen.</span>
            </span>
            <span aria-hidden="true" className="text-stone-400">→</span>
          </Link>
        </div>
      </section>

      {/* Biblioteca de subidas (para limpiar) */}
      <section className="adm-panel">
        <button
          type="button"
          className="adm-section-title flex w-full items-center justify-between"
          onClick={() => setLibOpen((o) => !o)}
        >
          <span>Biblioteca de imágenes subidas ({media.length})</span>
          <span aria-hidden="true" className="text-stone-400">{libOpen ? "▲" : "▼"}</span>
        </button>
        {libOpen &&
          (media.length === 0 ? (
            <p className="text-sm text-stone-500">Aún no has subido imágenes. Usa “Cambiar imagen” en cualquier tarjeta de arriba.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {media.map((m) => (
                <figure key={m.id} className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.filename} className="aspect-square w-full object-cover" />
                  <figcaption className="truncate px-2 py-1 text-[11px] text-stone-500">{m.filename}</figcaption>
                  <button
                    type="button"
                    onClick={() => onDelete(m.id)}
                    className="w-full border-t border-stone-100 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Borrar
                  </button>
                </figure>
              ))}
            </div>
          ))}
      </section>
    </div>
  );
}
