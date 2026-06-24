"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/authz";
import { locales } from "@/lib/i18n/config";
import { DEFAULT_PRICING, EXTRA_IDS } from "@/lib/pricing";

const schema = z.object({
  types: z.array(
    z.object({
      id: z.string(),
      base: z.number().int().min(0).nullable(),
      weeks: z.string().nullable(),
    }),
  ),
  extras: z.array(z.object({ id: z.string(), price: z.number().int().min(0) })),
});

export type PricingState = { ok: boolean; error?: string };

function num(formData: FormData, key: string): { value: number | null; bad: boolean } {
  const raw = formData.get(key);
  const str = typeof raw === "string" ? raw.trim() : "";
  if (str === "") return { value: null, bad: false };
  const n = Number(str);
  return Number.isFinite(n) ? { value: Math.round(n), bad: false } : { value: null, bad: true };
}

export async function savePricing(
  _prev: PricingState,
  formData: FormData,
): Promise<PricingState> {
  if (!(await isAdmin())) return { ok: false, error: "No autorizado." };

  let bad = false;
  const types = DEFAULT_PRICING.types.map((t) => {
    const base = num(formData, `type_${t.id}_base`);
    if (base.bad) bad = true;
    const weeksRaw = formData.get(`type_${t.id}_weeks`);
    const weeks = typeof weeksRaw === "string" && weeksRaw.trim() !== "" ? weeksRaw.trim() : null;
    return { id: t.id, base: base.value, weeks };
  });

  const extras = EXTRA_IDS.map((id) => {
    const price = num(formData, `extra_${id}`);
    if (price.bad) bad = true;
    return { id, price: price.value ?? 0 };
  });

  if (bad) return { ok: false, error: "Hay valores numéricos inválidos." };

  const parsed = schema.safeParse({ types, extras });
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  try {
    await db.$transaction([
      ...parsed.data.types.map((t, i) =>
        db.pricingType.upsert({
          where: { id: t.id },
          create: { id: t.id, base: t.base, weeks: t.weeks, sortOrder: i },
          update: { base: t.base, weeks: t.weeks, sortOrder: i },
        }),
      ),
      ...parsed.data.extras.map((e, i) =>
        db.pricingExtra.upsert({
          where: { id: e.id },
          create: { id: e.id, price: e.price, sortOrder: i },
          update: { price: e.price, sortOrder: i },
        }),
      ),
    ]);
  } catch {
    return { ok: false, error: "No se pudo guardar en la base de datos." };
  }

  // La calculadora vive en la home de cada locale.
  for (const l of locales) revalidatePath(`/${l}`);

  return { ok: true };
}
