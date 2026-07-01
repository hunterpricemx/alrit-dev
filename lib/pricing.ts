/**
 * Modelo de precios de la calculadora.
 *
 * ⚠️ VALORES PLACEHOLDER (MXN). Reemplaza `base`, `weeks` y `EXTRAS` con los
 * precios y tiempos reales — la calculadora y el resumen se actualizan solos.
 */

export type ProjectTypeId =
  | "landing"
  | "ecommerce"
  | "lms"
  | "realestate"
  | "mobile"
  | "custom"; // sistema / app a medida → cotización personalizada

export type ExtraId = "multilang" | "blog" | "payments" | "seo";

export type ProjectType = {
  id: ProjectTypeId;
  /** Precio base en MXN. `null` => proyecto a medida (sin precio instantáneo). */
  base: number | null;
  /** Rango de tiempo estimado. `null` para proyectos a medida. */
  weeks: string | null;
};

export const CURRENCY = "MXN";

export const PROJECT_TYPES: ProjectType[] = [
  { id: "landing", base: 8000, weeks: "2 a 3 semanas" },
  { id: "ecommerce", base: 35000, weeks: "4 a 6 semanas" },
  { id: "lms", base: 45000, weeks: "4 a 6 semanas" },
  { id: "realestate", base: 40000, weeks: "5 a 7 semanas" },
  { id: "mobile", base: 60000, weeks: "8 a 12 semanas" },
  { id: "custom", base: null, weeks: null },
];

export const EXTRAS: Record<ExtraId, number> = {
  multilang: 6000,
  blog: 5000,
  payments: 8000,
  seo: 7000,
};

export const EXTRA_IDS = Object.keys(EXTRAS) as ExtraId[];

// ─── Promo de temporada ───────────────────────────────────────────────
/** Precios de temporada (MXN) por tipo. Se muestran sobre el precio regular (`base`). */
export const PROMO_PRICES: Partial<Record<ProjectTypeId, number>> = {
  landing: 7000,
  ecommerce: 20000,
  lms: 30000,
  realestate: 20000,
  mobile: 50000,
};

/** Fin de la promo: 31 de agosto de 2026 (fin del día, hora CDMX). */
export const PROMO_ENDS_AT = "2026-08-31";

/** ¿La promo sigue vigente? */
export function isPromoActive(now: Date = new Date()): boolean {
  return now <= new Date(`${PROMO_ENDS_AT}T23:59:59-06:00`);
}

/** Precio a mostrar: con promo vigente → { current: promo, was: base }; si no, solo `current`. */
export function displayPrice(
  type: ProjectType,
  now: Date = new Date(),
): { current: number; was: number | null } | null {
  if (type.base === null) return null;
  const promo = PROMO_PRICES[type.id];
  if (promo != null && isPromoActive(now)) return { current: promo, was: type.base };
  return { current: type.base, was: null };
}

/** Conjunto de precios resuelto (constantes por defecto o overrides de la DB). */
export type Pricing = { types: ProjectType[]; extras: Record<ExtraId, number> };

/** Fallback en código — lo usa `getPricingAsync` si la DB está vacía/caída. */
export const DEFAULT_PRICING: Pricing = { types: PROJECT_TYPES, extras: EXTRAS };

export function getType(id: ProjectTypeId): ProjectType | undefined {
  return PROJECT_TYPES.find((t) => t.id === id);
}

export function getTypeFrom(types: ProjectType[], id: ProjectTypeId): ProjectType | undefined {
  return types.find((t) => t.id === id);
}

export type Estimate =
  | { kind: "price"; amount: number }
  | { kind: "custom" };

/** Estimación pura: recibe los precios por argumento (no importa constantes). */
export function estimateFrom(pricing: Pricing, typeId: ProjectTypeId, extras: ExtraId[]): Estimate {
  const t = getTypeFrom(pricing.types, typeId);
  if (!t || t.base === null) return { kind: "custom" };
  const extrasTotal = extras.reduce((sum, id) => sum + (pricing.extras[id] ?? 0), 0);
  return { kind: "price", amount: t.base + extrasTotal };
}

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}
