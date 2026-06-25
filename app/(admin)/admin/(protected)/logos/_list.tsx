"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveLogo, deleteLogo } from "../../_actions/logos";

type Row = { id: string; name: string; image: string; group: "BRAND" | "TECH"; sortOrder: number; published: boolean };
type MediaItem = { id: string; url: string; filename: string };

const GROUPS: { key: "BRAND" | "TECH"; label: string }[] = [
  { key: "BRAND", label: "Marcas (clientes)" },
  { key: "TECH", label: "Tecnologías" },
];

function Editor({ row, group, media, onDone }: { row?: Row; group: "BRAND" | "TECH"; media: MediaItem[]; onDone: () => void }) {
  const [name, setName] = useState(row?.name ?? "");
  const [image, setImage] = useState(row?.image ?? "");
  const [sortOrder, setSortOrder] = useState(row?.sortOrder ?? 0);
  const [published, setPublished] = useState(row?.published ?? true);
  const [busy, setBusy] = useState(false);

  return (
    <div className="adm-logo-edit">
      <input className="adm-input" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="adm-input" placeholder="/ruta o URL" value={image} onChange={(e) => setImage(e.target.value)} />
      {media.length > 0 && (
        <select className="adm-input" value="" onChange={(e) => e.target.value && setImage(e.target.value)}>
          <option value="">— biblioteca —</option>
          {media.map((m) => <option key={m.id} value={m.url}>{m.filename}</option>)}
        </select>
      )}
      <input className="adm-input adm-logo-edit__order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
      <label className="adm-check"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Público</label>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <img className="adm-slot__img" src={image} alt="" />}
      <button type="button" className="adm-btn" disabled={busy || !name || !image} onClick={async () => {
        setBusy(true);
        await saveLogo({ id: row?.id, name, image, group, sortOrder, published });
        setBusy(false);
        onDone();
      }}>{busy ? "Guardando…" : row ? "Guardar" : "Añadir"}</button>
    </div>
  );
}

export default function LogosList({ brand, tech, media }: { brand: Row[]; tech: Row[]; media: MediaItem[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const byGroup: Record<"BRAND" | "TECH", Row[]> = { BRAND: brand, TECH: tech };

  return (
    <div className="adm-logos">
      {GROUPS.map((g) => (
        <section className="adm-panel" key={g.key}>
          <p className="adm-section-title">{g.label}</p>
          {byGroup[g.key].map((row) => (
            <div className="adm-logo-row" key={row.id}>
              <Editor row={row} group={g.key} media={media} onDone={refresh} />
              <button type="button" className="adm-danger__btn" onClick={() => deleteLogo(row.id).then(refresh)}>Eliminar</button>
            </div>
          ))}
          <div className="adm-logo-row adm-logo-row--new">
            <Editor group={g.key} media={media} onDone={refresh} />
          </div>
        </section>
      ))}
    </div>
  );
}
