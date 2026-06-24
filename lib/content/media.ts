import { db } from "@/lib/db";
import { safeQuery } from "./safe";
import type { SlotMap } from "@/lib/slots";

/**
 * Mapa { slot → url } de las asignaciones en la DB. `{}` si vacío/caída
 * → los componentes caen al fallback en /public (cero regresión).
 */
export async function getSlotMap(): Promise<SlotMap> {
  return safeQuery(async () => {
    const rows = await db.mediaSlot.findMany({ include: { media: true } });
    const map: SlotMap = {};
    for (const r of rows) map[r.slot] = r.media.url;
    return map;
  }, {});
}
