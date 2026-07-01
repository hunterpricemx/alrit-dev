import { cache } from "react";
import { db } from "@/lib/db";
import { safeQuery } from "./safe";

/** Etiquetas y scripts editables desde /admin/configuracion. */
export type SiteScripts = {
  gtmId: string; // Google Tag Manager (GTM-XXXXXXX)
  metaPixelId: string; // Meta/Facebook Pixel (numérico)
  googleVerification: string; // Search Console (content del meta)
  bingVerification: string; // Bing (msvalidate.01)
  headScripts: string; // código libre en <head>
  bodyScripts: string; // código libre al final de <body>
};

export const DEFAULT_SCRIPTS: SiteScripts = {
  gtmId: "",
  metaPixelId: "",
  googleVerification: "",
  bingVerification: "",
  headScripts: "",
  bodyScripts: "",
};

/** Guardado como un blob JSON en TextOverride (evita una migración de esquema). */
export const SCRIPTS_KEY = "site:scripts";

export const getScriptsAsync = cache(async (): Promise<SiteScripts> => {
  return safeQuery(async () => {
    const row = await db.textOverride.findFirst({ where: { key: SCRIPTS_KEY } });
    if (!row) return DEFAULT_SCRIPTS;
    try {
      return { ...DEFAULT_SCRIPTS, ...(JSON.parse(row.value) as Partial<SiteScripts>) };
    } catch {
      return DEFAULT_SCRIPTS;
    }
  }, DEFAULT_SCRIPTS);
});
