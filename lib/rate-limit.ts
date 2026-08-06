/**
 * Rate limiting en memoria (ventana deslizante).
 *
 * El sitio corre en un único contenedor, así que un Map basta y evita una
 * dependencia externa o una migración. Dos límites de este enfoque, asumidos a
 * propósito: el contador se reinicia en cada despliegue, y si algún día se
 * escala a más de una réplica cada una llevará su propia cuenta. Para frenar
 * spam de formularios y fuerza bruta de contraseñas es suficiente; si hiciera
 * falta algo más duro, el reemplazo natural es Redis con la misma interfaz.
 */

/** Marcas de tiempo de los intentos recientes, por clave. */
const hits = new Map<string, number[]>();

/** Tope de claves en memoria: por encima se barren las que ya expiraron. */
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  /** Segundos que faltan para poder reintentar. 0 cuando `ok` es true. */
  retryAfter: number;
};

function sweep(now: number, windowMs: number): void {
  for (const [key, times] of hits) {
    if (times.length === 0 || times[times.length - 1] <= now - windowMs) hits.delete(key);
  }
}

/**
 * Consume un intento para `key`. Devuelve `ok: false` si ya se pasó del límite
 * dentro de la ventana.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const cutoff = now - windowMs;
  const times = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (times.length >= limit) {
    hits.set(key, times);
    // times[0] es el intento más viejo que sigue contando; al expirar se libera un hueco.
    return { ok: false, retryAfter: Math.max(1, Math.ceil((times[0] + windowMs - now) / 1000)) };
  }

  times.push(now);
  hits.set(key, times);
  if (hits.size > MAX_KEYS) sweep(now, windowMs);
  return { ok: true, retryAfter: 0 };
}

/**
 * IP del visitante. Detrás de Cloudflare la buena es `cf-connecting-ip`;
 * `x-forwarded-for` es el respaldo y puede venir con varios saltos.
 *
 * Nunca lanza: si se llama fuera del contexto de una petición devuelve
 * "unknown", que agrupa a esos casos en un mismo bucket en vez de tumbar la
 * acción que la invoca.
 */
export async function clientIp(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const cf = h.get("cf-connecting-ip");
    if (cf) return cf;
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0]!.trim();
    return h.get("x-real-ip") ?? "unknown";
  } catch {
    return "unknown";
  }
}
