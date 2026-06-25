"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

export type SettingsFormState = { ok: boolean; error?: string };

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

const schema = z.object({
  email: z.string().email().or(z.literal("")),
  whatsapp: z.string().max(20),
  phone: z.string().max(30),
  streetAddress: z.string().max(160),
  addressLocality: z.string().max(120),
  addressRegion: z.string().max(120),
  postalCode: z.string().max(20),
  addressCountry: z.string().max(4),
  instagram: z.string().max(200),
  linkedin: z.string().max(200),
  github: z.string().max(200),
  facebook: z.string().max(200),
  x: z.string().max(200),
  gaId: z.string().max(20).regex(/^(G-[A-Z0-9]+)?$/i, "GA ID inválido (formato G-XXXXXXX)"),
  priceRange: z.string().max(8),
});

export async function saveSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin();

  const fields = {
    email: str(formData.get("email")),
    whatsapp: str(formData.get("whatsapp")).replace(/\D/g, ""),
    phone: str(formData.get("phone")),
    streetAddress: str(formData.get("streetAddress")),
    addressLocality: str(formData.get("addressLocality")),
    addressRegion: str(formData.get("addressRegion")),
    postalCode: str(formData.get("postalCode")),
    addressCountry: str(formData.get("addressCountry")) || "MX",
    instagram: str(formData.get("instagram")),
    linkedin: str(formData.get("linkedin")),
    github: str(formData.get("github")),
    facebook: str(formData.get("facebook")),
    x: str(formData.get("x")),
    gaId: str(formData.get("gaId")),
    priceRange: str(formData.get("priceRange")) || "$$",
  };

  const parsed = schema.safeParse(fields);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  try {
    await db.siteSettings.upsert({
      where: { id: "site" },
      create: { id: "site", ...parsed.data },
      update: parsed.data,
    });
  } catch {
    return { ok: false, error: "No se pudo guardar." };
  }

  revalidatePath("/[locale]", "layout");
  return { ok: true };
}
