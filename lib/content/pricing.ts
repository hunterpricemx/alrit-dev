import { db } from "@/lib/db";
import { safeQuery } from "./safe";
import { DEFAULT_PRICING, type Pricing, type ProjectType, type ExtraId } from "@/lib/pricing";

/**
 * Resuelve los precios: lee los overrides de la DB y cae a las constantes en
 * código (`DEFAULT_PRICING`) si la DB está vacía, caída o en build.
 * Preserva el orden e ids canónicos de los defaults.
 */
export async function getPricingAsync(): Promise<Pricing> {
  return safeQuery(async () => {
    const [typeRows, extraRows] = await Promise.all([
      db.pricingType.findMany(),
      db.pricingExtra.findMany(),
    ]);
    if (typeRows.length === 0 && extraRows.length === 0) return DEFAULT_PRICING;

    const types: ProjectType[] = DEFAULT_PRICING.types.map((def) => {
      const row = typeRows.find((r) => r.id === def.id);
      return row ? { id: def.id, base: row.base, weeks: row.weeks } : def;
    });

    const extras = { ...DEFAULT_PRICING.extras };
    for (const e of extraRows) {
      if (e.id in extras) extras[e.id as ExtraId] = e.price;
    }

    return { types, extras };
  }, DEFAULT_PRICING);
}
