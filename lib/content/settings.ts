import { cache } from "react";
import { db } from "@/lib/db";
import { safeQuery } from "./safe";

export type SiteSettings = {
  email: string;
  whatsapp: string;
  phone: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  instagram: string;
  linkedin: string;
  github: string;
  facebook: string;
  x: string;
  gaId: string;
  priceRange: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  email: "hola@alrit.dev",
  whatsapp: "",
  phone: "",
  streetAddress: "",
  addressLocality: "",
  addressRegion: "",
  postalCode: "",
  addressCountry: "MX",
  instagram: "",
  linkedin: "",
  github: "",
  facebook: "",
  x: "",
  gaId: "",
  priceRange: "$$",
};

/** Singleton de configuración del sitio. Cacheado por request. Fallback a defaults. */
export const getSettingsAsync = cache(async (): Promise<SiteSettings> => {
  return safeQuery(async () => {
    const row = await db.siteSettings.findUnique({ where: { id: "site" } });
    if (!row) return DEFAULT_SETTINGS;
    return {
      email: row.email,
      whatsapp: row.whatsapp,
      phone: row.phone,
      streetAddress: row.streetAddress,
      addressLocality: row.addressLocality,
      addressRegion: row.addressRegion,
      postalCode: row.postalCode,
      addressCountry: row.addressCountry,
      instagram: row.instagram,
      linkedin: row.linkedin,
      github: row.github,
      facebook: row.facebook,
      x: row.x,
      gaId: row.gaId,
      priceRange: row.priceRange,
    };
  }, DEFAULT_SETTINGS);
});

/** URLs de redes reales para sameAs (omite las vacías). */
export function sameAs(s: SiteSettings): string[] {
  return [s.instagram, s.linkedin, s.github, s.facebook, s.x].map((u) => u.trim()).filter(Boolean);
}

/** Enlace de WhatsApp (o null si no está configurado). */
export function whatsappHref(s: SiteSettings, message?: string): string | null {
  const num = s.whatsapp.replace(/\D/g, "");
  if (!num) return null;
  return `https://wa.me/${num}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
