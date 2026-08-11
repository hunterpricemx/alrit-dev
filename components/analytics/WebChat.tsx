"use client";

import Script from "next/script";

/**
 * Widget de chat web (wa.programalab.dev).
 *
 * Inerte mientras `NEXT_PUBLIC_WEBCHAT_KEY` esté vacía: sin la clave no se
 * renderiza nada y no se pide ningún archivo. Así el código puede vivir en
 * producción antes de que el backend del widget exista, sin dejar una petición
 * 404 en cada visita.
 *
 * Va por variable de entorno y no por la tabla de ajustes a propósito: el
 * layout se prerenderiza durante el build, cuando Postgres todavía no existe,
 * así que cualquier valor que viniera de la base quedaría vacío en el HTML
 * generado y el widget desaparecería en cada reconstrucción.
 *
 * `afterInteractive` mantiene el script fuera de la ruta crítica de render.
 * El widget se monta en Shadow DOM, así que no hereda ni contamina los estilos
 * del sitio.
 *
 * Nota para quien lo active: `next/script` inyecta la etiqueta dinámicamente,
 * de modo que `document.currentScript` sale null. El widget tiene un respaldo
 * (`querySelector('script[src*="/public/webchat/widget.js"]')`) que sí la
 * encuentra y lee el `data-key`.
 */

const WEBCHAT_SRC = "https://wa.programalab.dev/public/webchat/widget.js";

export default function WebChat() {
  const key = process.env.NEXT_PUBLIC_WEBCHAT_KEY;
  if (!key) return null;

  return <Script src={WEBCHAT_SRC} data-key={key} strategy="afterInteractive" />;
}
