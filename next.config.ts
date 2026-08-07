import type { NextConfig } from "next";

const IMG_DIRS = ["hero", "portfolio", "brands", "tech"];

/**
 * CSP deliberadamente sin `script-src`.
 *
 * Un CSP estricto necesita nonce por petición, y el nonce obliga a renderizado
 * dinámico: perderíamos el SSG y el `revalidate` de todas las páginas. Además
 * el panel permite inyectar etiquetas de marketing arbitrarias (GTM, Pixel,
 * código libre) desde /admin/configuracion, que un `script-src` bloquearía.
 *
 * Estas directivas cierran clickjacking, secuestro de formularios, inyección de
 * <base> y de plugins sin tocar la ejecución de scripts ni el renderizado.
 */
const CSP = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // Redundante con frame-ancestors, pero cubre navegadores que no lo soportan.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Sin `includeSubDomains` a propósito: media.alrit.dev todavía no existe (no
  // resuelve en DNS) y comprometerlo a HTTPS antes de levantarlo lo dejaría
  // inaccesible. Añadirlo cuando ese subdominio esté sirviendo por HTTPS.
  // `preload` es aparte y prácticamente irreversible: decisión consciente.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  // Hrefs are built from dynamic locale segments (`/${locale}#...`), so we opt
  // out of typed routes to keep those template-literal links ergonomic.
  typedRoutes: false,
  // Self-contained server bundle for the production Docker image.
  output: "standalone",
  // Formatos modernos cuando se adopte next/image (sharp ya está en la imagen).
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  // No anunciar el framework: es información gratis para quien busca objetivos.
  poweredByHeader: false,
  async headers() {
    return [
      // Cabeceras de seguridad en todo el sitio.
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Cache agresivo e inmutable para los assets de imagen.
      ...IMG_DIRS.map((dir) => ({
        source: `/${dir}/:path*`,
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      })),
    ];
  },
};

export default nextConfig;
