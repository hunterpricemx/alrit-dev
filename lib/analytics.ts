/** Dispara un evento a GA4 si está cargado (no-op si no hay analítica/consentimiento). */
export type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.("event", name, params ?? {});
}
