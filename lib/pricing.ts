/**
 * Modelo de precios de la mini-calculadora.
 *
 * ⚠️ VALORES PLACEHOLDER (MXN). Reemplaza `base`, `sizeMultipliers` y `extras`
 * con los precios reales — la calculadora y el copy se actualizan solos.
 */

export type ProjectTypeId =
  | "landing"
  | "wordpress"
  | "ecommerce"
  | "lms"
  | "realestate"
  | "custom"; // sistema / app a medida → captura datos, sin precio

export type SizeId = "small" | "medium" | "large";
export type ExtraId = "multilang" | "blog" | "payments" | "seo";

export type ProjectType = {
  id: ProjectTypeId;
  /** Precio base en MXN. `null` => proyecto a medida (sin precio instantáneo). */
  base: number | null;
};

export const CURRENCY = "MXN";

export const PROJECT_TYPES: ProjectType[] = [
  { id: "landing", base: 8000 },
  { id: "wordpress", base: 18000 },
  { id: "ecommerce", base: 35000 },
  { id: "lms", base: 45000 },
  { id: "realestate", base: 40000 },
  { id: "custom", base: null },
];

export const SIZE_MULTIPLIERS: Record<SizeId, number> = {
  small: 1,
  medium: 1.6,
  large: 2.5,
};

export const EXTRAS: Record<ExtraId, number> = {
  multilang: 6000,
  blog: 5000,
  payments: 8000,
  seo: 7000,
};

export type Estimate =
  | { kind: "price"; amount: number }
  | { kind: "custom" };

export function estimate(
  typeId: ProjectTypeId,
  size: SizeId,
  extras: ExtraId[]
): Estimate {
  const type = PROJECT_TYPES.find((t) => t.id === typeId);
  if (!type || type.base === null) return { kind: "custom" };

  const extrasTotal = extras.reduce((sum, id) => sum + (EXTRAS[id] ?? 0), 0);
  const amount = Math.round(type.base * SIZE_MULTIPLIERS[size] + extrasTotal);
  return { kind: "price", amount };
}

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}
