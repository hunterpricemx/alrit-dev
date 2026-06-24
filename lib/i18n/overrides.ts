import type { Dictionary } from "./dictionaries/es";

/** Catálogo acotado de textos editables desde el admin (M4). */
export type EditableKey = { key: string; label: string; group: string; multiline?: boolean };

export const EDITABLE_KEYS: EditableKey[] = [
  { group: "General", key: "nav.cta", label: "Botón de navegación (CTA)" },

  { group: "Hero", key: "hero.titleA", label: "Título (línea 1)" },
  { group: "Hero", key: "hero.titleAccent", label: "Título (acento)" },
  { group: "Hero", key: "hero.lede", label: "Texto", multiline: true },
  { group: "Hero", key: "hero.primary", label: "Botón principal" },
  { group: "Hero", key: "hero.secondary", label: "Botón secundario" },

  { group: "Marca", key: "social.eyebrow", label: "Eyebrow" },
  { group: "Marca", key: "social.title", label: "Título" },
  { group: "Marca", key: "social.text", label: "Texto", multiline: true },
  { group: "Marca", key: "social.trusted", label: "Línea de confianza" },

  { group: "Servicios (resumen)", key: "servicesX.eyebrow", label: "Eyebrow" },
  { group: "Servicios (resumen)", key: "servicesX.titleA", label: "Título (línea 1)" },
  { group: "Servicios (resumen)", key: "servicesX.titleAccent", label: "Título (acento)" },
  { group: "Servicios (resumen)", key: "servicesX.subtitle", label: "Subtítulo", multiline: true },

  { group: "Proceso", key: "process.eyebrow", label: "Eyebrow" },
  { group: "Proceso", key: "process.titleA", label: "Título (línea 1)" },
  { group: "Proceso", key: "process.titleAccent", label: "Título (acento)" },
  { group: "Proceso", key: "process.subtitle", label: "Subtítulo", multiline: true },
  { group: "Proceso", key: "process.banner", label: "Banner" },

  { group: "Resultados", key: "results.eyebrow", label: "Eyebrow" },
  { group: "Resultados", key: "results.titleA", label: "Título (línea 1)" },
  { group: "Resultados", key: "results.titleAccent", label: "Título (acento)" },

  { group: "CTA final", key: "finalCta.title", label: "Título" },
  { group: "CTA final", key: "finalCta.text", label: "Texto", multiline: true },
  { group: "CTA final", key: "finalCta.primary", label: "Botón principal" },
  { group: "CTA final", key: "finalCta.secondary", label: "Botón secundario" },

  { group: "Footer", key: "footer.tagline", label: "Tagline" },
];

export const EDITABLE_KEY_SET = new Set(EDITABLE_KEYS.map((k) => k.key));

/** Lee el valor base por dotted-path (para mostrarlo como placeholder). */
export function getByPath(obj: unknown, path: string): string {
  const v = path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
  return typeof v === "string" ? v : "";
}

function setPath(obj: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = cur[parts[i]];
    if (!next || typeof next !== "object") return; // path inexistente: ignora
    cur = next as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

/** Devuelve una copia del dict con los overrides aplicados (no muta el base). */
export function applyOverrides(base: Dictionary, rows: { key: string; value: string }[]): Dictionary {
  if (rows.length === 0) return base;
  const clone = structuredClone(base) as Dictionary;
  for (const r of rows) {
    if (EDITABLE_KEY_SET.has(r.key)) {
      setPath(clone as unknown as Record<string, unknown>, r.key, r.value);
    }
  }
  return clone;
}
