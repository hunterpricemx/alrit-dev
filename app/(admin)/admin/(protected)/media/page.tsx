import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { getSlotMap } from "@/lib/content/media";
import { SLOTS } from "@/lib/slots";
import MediaManager from "./_manager";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const media = await safeQuery(
    () => db.media.findMany({ orderBy: { createdAt: "desc" } }),
    [],
  );
  const slotMap = await getSlotMap();
  const rows = await safeQuery(() => db.mediaSlot.findMany(), []);
  const assignments: Record<string, string> = {};
  for (const r of rows) assignments[r.slot] = r.mediaId;

  const plainMedia = media.map((m) => ({
    id: m.id,
    url: m.url,
    filename: m.filename,
    mime: m.mime,
    width: m.width,
    height: m.height,
  }));

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Medios</h1>
        <p className="adm__subtitle">Sube imágenes y asígnalas a los espacios del sitio (logos, mockups, tecnologías).</p>
      </header>
      <MediaManager media={plainMedia} slotMap={slotMap} assignments={assignments} slots={SLOTS} />
    </>
  );
}
