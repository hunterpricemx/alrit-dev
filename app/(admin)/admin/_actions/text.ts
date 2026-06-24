"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/authz";
import { getDictionary } from "@/lib/i18n";
import { EDITABLE_KEYS, getByPath } from "@/lib/i18n/overrides";
import { locales } from "@/lib/i18n/config";

export type TextState = { ok: boolean; error?: string };

export async function saveTextOverrides(
  _prev: TextState,
  formData: FormData,
): Promise<TextState> {
  if (!(await isAdmin())) return { ok: false, error: "No autorizado" };

  const ops: Promise<unknown>[] = [];
  for (const loc of locales) {
    const base = getDictionary(loc);
    for (const { key } of EDITABLE_KEYS) {
      const raw = formData.get(`${loc}__${key}`);
      const value = typeof raw === "string" ? raw.trim() : "";
      const baseVal = getByPath(base, key);
      if (value === "" || value === baseVal) {
        // Igual al base o vacío → no guardamos override (DB mínima).
        ops.push(db.textOverride.deleteMany({ where: { key, locale: loc } }));
      } else {
        ops.push(
          db.textOverride.upsert({
            where: { key_locale: { key, locale: loc } },
            create: { key, locale: loc, value },
            update: { value },
          }),
        );
      }
    }
  }

  try {
    await Promise.all(ops);
  } catch {
    return { ok: false, error: "No se pudo guardar en la base de datos." };
  }

  revalidatePath("/[locale]", "layout");
  return { ok: true };
}
