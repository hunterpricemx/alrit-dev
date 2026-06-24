import type { Locale } from "./config";
import es, { type Dictionary } from "./dictionaries/es";
import en from "./dictionaries/en";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import { applyOverrides } from "./overrides";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? es;
}

/** Diccionario con overrides de textos de la DB (M4); fallback al base. */
export async function getDictionaryAsync(locale: Locale): Promise<Dictionary> {
  const base = getDictionary(locale);
  const rows = await safeQuery(
    () => db.textOverride.findMany({ where: { locale } }),
    [],
  );
  return applyOverrides(base, rows);
}

export type { Dictionary };
