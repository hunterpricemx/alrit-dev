/**
 * Lectura resiliente de la base de datos para el patrón OVERRIDES.
 *
 * Si la DB está vacía, caída o inalcanzable (también durante `next build`),
 * `safeQuery` devuelve el `fallback` (el contenido en código) en lugar de lanzar.
 * Así el sitio nunca se rompe y el build no depende de Postgres.
 */
export async function safeQuery<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[safeQuery] usando fallback en código:", (err as Error)?.message);
    }
    return fallback;
  }
}
