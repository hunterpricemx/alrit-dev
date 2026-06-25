"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  image: z.string().min(1).max(500),
  group: z.enum(["BRAND", "TECH"]),
  sortOrder: z.number().int(),
  published: z.boolean(),
});

export async function saveLogo(input: {
  id?: string;
  name: string;
  image: string;
  group: "BRAND" | "TECH";
  sortOrder: number;
  published: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  const { id, ...data } = parsed.data;
  try {
    if (id) await db.logo.update({ where: { id }, data });
    else await db.logo.create({ data });
  } catch {
    return { ok: false, error: "No se pudo guardar." };
  }
  return { ok: true };
}

export async function deleteLogo(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await db.logo.delete({ where: { id } });
  return { ok: true };
}
