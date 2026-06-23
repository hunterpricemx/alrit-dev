# Megamenú + Visualizadores iMac/iPhone (diseño)

**Fecha:** 2026-06-23
**Estado:** Aprobado — implementación en curso

## Contexto
Parte 1 de 3 de la tanda "admin / casos / menú". El admin (CMS completo en Docker:
imágenes + textos + precios) se diseña después. Ahora: megamenú + visualizadores.

## A) Megamenú (header)
Rehace `components/layout/Header.tsx` con desplegables (hover/focus en desktop,
drawer en móvil). Sticky con blur, accesible (teclado, Esc, aria-expanded), cierra al salir.

Items:
- **Servicios** → megapanel: 8 servicios (ícono + nombre + 1 línea), agrupados
  "Sitios web" (wordpress, webdev, lms, ecommerce, realestate) y "Software & Apps"
  (systems, mobile, automation) + tarjeta destacada "¿No sabes cuál? Calcula tu presupuesto".
  Enlaces reales a `/[locale]/servicios/[slug]`.
- **Portafolio** → megapanel: 3-4 casos destacados (thumb + nombre) + "Ver todos".
- **Blog** → megapanel: categorías marcadas **"Próximamente"** (sin enlaces, no hay blog).
- **Empresa** → Nosotros (pronto), Proceso (#process), Contacto (pronto).
- **Calculadora** (link a #calculator) + CTA "Cotiza tu proyecto" + selector ES/EN.

Móvil: botón hamburguesa → drawer con secciones expandibles.

Copy nuevo en `dict.mega` (ES/EN). Componente cliente (estado de apertura).

## B) Visualizadores iMac / iPhone 17 Pro (casos)
En `components/portfolio/CaseStudy.tsx`, el screenshot único se reemplaza por un
**dúo de dispositivos**:
- **iMac**: marco CSS (pantalla + barbilla + base) con la captura de escritorio (`project.image`).
- **iPhone 17 Pro**: marco CSS (cuerpo titanio + Dynamic Island) con la captura móvil
  (`project.imageMobile`), encimado estilo Apple.
- Marcos en CSS puro (sin imágenes de marco). Apila en móvil. Respeta reduced-motion.

Datos: agregar `imageMobile` a `lib/content/portfolio.data.json` (capturas móviles de los
7 sitios → `public/portfolio/{slug}-mobile.png`). Componente nuevo `components/ui/DeviceFrame.tsx`
(iMac + iPhone) reutilizable.

## Fuera de alcance (ahora)
- Admin/CMS (Docker) — siguiente fase.
- Páginas reales de Blog, Nosotros, Contacto (se marcan "pronto").
