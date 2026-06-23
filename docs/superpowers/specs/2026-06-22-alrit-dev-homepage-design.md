# Alrit.dev — Homepage (diseño)

**Fecha:** 2026-06-22
**Estado:** Aprobado (arquitectura) — implementación en curso

## Contexto

Alrit.dev es la evolución de **Hunter Price Mx**: de agencia de marketing digital a
empresa de **desarrollo web**. El sitio debe ser agradable pero **enfocado a conversión**
y **mega optimizado para SEO**.

**Productos:** Sitios WordPress, desarrollo de páginas web, sitios LMS, e-commerce,
sitios para Real Estate, sistemas a medida, apps móviles, automatizaciones.
Cada servicio tendrá su propia landing (futuro). Habrá sección de **portafolio**.

## Decisiones tomadas

| Tema | Decisión |
|------|----------|
| Stack | Next.js 16 (App Router) + React 19 + Tailwind v4. SSG/ISR para SEO. |
| Idioma | **Bilingüe ES + EN** con rutas `/es` y `/en` (hreflang, sitemap por locale). |
| Conversión | **Mini-calculadora de proyectos** en la home (2-3 inputs → estimado). |
| Marca | Logo placeholder tipográfico "Alrit.dev"; colores flexibles. |
| Estilo | **Claro y vivo** (fondo claro, gradiente naranja→rosa→morado), como la referencia. |
| Primer entregable | **Homepage completa**. |
| Nombrado CSS | **BEM** + Tailwind disponible. Animaciones en CSS BEM. |
| Precios | **Placeholder** centralizado en `lib/pricing.ts` (fácil de reemplazar). |

## Arquitectura de la homepage (aprobada)

1. **Header** sticky: nav + selector idioma ES/EN + CTA "Cotiza tu proyecto".
2. **Hero magnético** (ya construido): cards en abanico con efecto magnético al cursor.
3. **Prueba social**: "La evolución de Hunter Price Mx" + logos de clientes (placeholder).
4. **Servicios**: grid de tarjetas animadas (8 servicios), cada una enlaza a su futura landing.
5. **Mini-calculadora**: imán de conversión.
6. **Portafolio**: proyectos destacados (placeholders).
7. **Proceso**: 3-4 pasos animados.
8. **Testimonios**.
9. **CTA final + Footer** SEO-rico (enlaces a landings, contacto, schema.org).

## Mini-calculadora

**Inputs (3):**
1. **Tipo de proyecto** (select): Landing, WordPress, E-commerce, LMS, Real Estate,
   Sistema/App a medida.
2. **Tamaño** (segmented): Pequeño / Mediano / Grande.
3. **Extras** (toggles): Multi-idioma, Blog, Pasarela de pagos, SEO avanzado.

**Lógica:**
- Tipos de **web** → estimado instantáneo: `(base × multiplicador_tamaño) + Σ extras`,
  mostrado como **"desde $X MXN"**.
- **Sistema/App a medida** → NO da precio; muestra captura de datos (nombre, email,
  teléfono, brief) → envía cotización por correo.
- Todos los valores viven en `lib/pricing.ts` (placeholder, marcados como tales).

**Precios placeholder (MXN):**
| Tipo | Base |
|------|------|
| Landing | 8,000 |
| WordPress institucional | 18,000 |
| E-commerce | 35,000 |
| LMS | 45,000 |
| Real Estate | 40,000 |

Multiplicador tamaño: Pequeño ×1 · Mediano ×1.6 · Grande ×2.5
Extras: idioma +6,000 · blog +5,000 · pagos +8,000 · SEO avanzado +7,000

> ⚠️ Placeholders. Reemplazar en `lib/pricing.ts` con los precios reales.

## i18n

- Segmento de ruta `app/[locale]/...` con `locale ∈ {es, en}`.
- Diccionarios en `lib/i18n/dictionaries/{es,en}.ts`.
- `/` redirige a `/es` (default). `<link rel="alternate" hreflang>` en cada página.

## SEO (mega hiper)

- Metadata por página vía `generateMetadata` (title, description, OG, Twitter).
- `sitemap.ts` y `robots.ts` dinámicos con ambas locales.
- JSON-LD: `Organization`, `WebSite`, `BreadcrumbList`, `Service` (en landings futuras).
- Imágenes optimizadas (`next/image`), `alt` descriptivos, fuentes con `display: swap`.
- HTML semántico, headings jerárquicos, Core Web Vitals priorizados.
- Canonical + hreflang por locale.

## Estructura de carpetas

```
app/
  [locale]/
    layout.tsx        # html lang, fuentes, header/footer
    page.tsx          # homepage (compone secciones)
  globals.css         # BEM + tokens + keyframes
  sitemap.ts
  robots.ts
components/
  hero/MagneticHero.tsx
  sections/{SocialProof,Services,Calculator,Portfolio,Process,Testimonials,FinalCta}.tsx
  layout/{Header,Footer,LocaleSwitcher}.tsx
lib/
  pricing.ts          # modelo de precios (placeholder)
  i18n/{config,dictionaries/es,dictionaries/en}.ts
  seo/jsonld.ts
```

## Componentes (responsabilidad única)

- **MagneticHero** — hero con cards magnéticas (ya hecho; se adapta copy + i18n).
- **Services** — datos de servicios + grid animado; enlaza a landings.
- **Calculator** — estado de los 3 inputs, cálculo desde `lib/pricing.ts`, branch web/sistema.
- **Portfolio** — grid de proyectos (placeholder), preparado para CMS futuro.
- **Header/Footer/LocaleSwitcher** — layout y navegación con i18n.

## Fuera de alcance (por ahora)

- Landings individuales por servicio (siguiente fase, una por una).
- Calculadora completa en página dedicada `/calculadora` (la home lleva la mini).
- CMS / backend real de portafolio y envío de correo (se deja la interfaz lista + stub).
- Precios reales (placeholder hasta que el cliente los entregue).
