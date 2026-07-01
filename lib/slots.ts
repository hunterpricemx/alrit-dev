/**
 * Catálogo de "slots" de imagen editables (M2).
 * Cada slot mapea a una imagen del sitio; el admin puede asignarle un Media
 * subido a MinIO. Si no hay asignación, se usa el `fallback` (ruta en /public).
 *
 * Este archivo es PURO (sin imports de DB) para poder usar `resolveSlot` en
 * componentes cliente. La lectura de la DB vive en lib/content/media.ts.
 */
export type SlotGroup = "mockup" | "brand" | "tech";
export type SlotDef = { id: string; label: string; group: SlotGroup; fallback: string };
export type SlotMap = Record<string, string>;

export const MOCKUP_SLOTS: SlotDef[] = [
  { id: "mockup-systems", label: "Sistemas y Landing", group: "mockup", fallback: "/hero/sass.png" },
  { id: "mockup-ecommerce", label: "E-commerce", group: "mockup", fallback: "/hero/ecommerce.png" },
  { id: "mockup-lms", label: "LMS / Cursos", group: "mockup", fallback: "/hero/lms.png" },
  { id: "mockup-realestate", label: "Real Estate", group: "mockup", fallback: "/hero/realstate.png" },
  { id: "mockup-mobile", label: "App móvil", group: "mockup", fallback: "/hero/app.png" },
];

const BRANDS: [file: string, label: string][] = [
  ["casas-krea", "Casas Krea"],
  ["universidad-hebraica", "Universidad Hebraica"],
  ["sanatorio-mexico", "Sanatorio México"],
  ["bds", "BDS Motos"],
  ["riu-logo", "RCIU Education"],
  ["sla", "SLA"],
  ["interlace", "Interlace"],
  ["comint", "Comint"],
  ["tienda-forestal", "Tienda Forestal"],
  ["evolution-week", "Evolution Week"],
  ["tame", "TAME"],
  ["toma", "Toma"],
];
export const BRAND_SLOTS: SlotDef[] = BRANDS.map(([file, label]) => ({
  id: `brand-${file}`,
  label: `Logo · ${label}`,
  group: "brand",
  fallback: `/brands/${file}.png`,
}));

const TECHS = ["nextjs", "react", "wordpress", "typescript", "supabase", "stripe", "reactnative"];
export const TECH_SLOTS: SlotDef[] = TECHS.map((f) => ({
  id: `tech-${f}`,
  label: `Tecnología · ${f}`,
  group: "tech",
  fallback: `/tech/${f}.svg`,
}));

export const SLOTS: SlotDef[] = [...MOCKUP_SLOTS, ...BRAND_SLOTS, ...TECH_SLOTS];

/** Mapea un id de servicio/tipo de proyecto a su slot de mockup. */
export function mockupSlot(serviceOrType: string): string {
  if (serviceOrType === "landing" || serviceOrType === "custom" || serviceOrType === "webdev" || serviceOrType === "wordpress" || serviceOrType === "automation") {
    return "mockup-systems";
  }
  return `mockup-${serviceOrType}`;
}
export const brandSlot = (file: string) => `brand-${file}`;
export const techSlot = (file: string) => `tech-${file}`;

/** Resuelve la URL de un slot con fallback. Puro: úsalo en componentes cliente. */
export function resolveSlot(map: SlotMap | undefined, id: string, fallback: string): string {
  return map?.[id] ?? fallback;
}
