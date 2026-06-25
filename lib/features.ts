/**
 * Feature flags reversibles. Para reactivar una sección oculta, poner su flag en `true`.
 * Lo leen nav/footer/megamenú/sitemap/layout y las rutas públicas (que dan 404 si está en false).
 * El admin de cada sección (/admin/blog, /admin/cursos) NO depende de estos flags.
 */
export const FEATURES = {
  blog: false, // ocultar el blog del sitio público
  lms: false, // ocultar cursos / aprendizaje en línea del sitio público
} as const;
