# Spec — Sweep CMS + calidad (portafolio unificado, logos editables, pulido)

Fecha: 2026-06-24 · Estado: aprobado el diseño, pendiente de plan de implementación.

## Contexto

Tras cerrar los subsistemas grandes (sitio, CMS M0–M4, LMS, portal de clientes,
cotizaciones, centro de operaciones), quedan **listas de contenido fijas en código**
que el admin no puede editar, y deuda de consistencia visual. Auditoría:

- **Ya editable (no tocar):** textos de Resultados/Proceso/Testimonios vienen del
  diccionario (overrides M4); imágenes de tecnologías y logos ya son reemplazables
  vía `MediaSlot`.
- **Componentes muertos (fuera de alcance):** `SocialProof.tsx` y `Testimonials.tsx`
  no se renderizan en ninguna página.
- **Lo realmente fijo (objetivo de este sweep):** 4 listas estructuradas —
  1. **Bento del home** (`components/sections/Portfolio.tsx`, array `BENTO`).
  2. **FEATURED del megamenú** (`components/layout/Header.tsx`, array hardcodeado).
  3. **Lista de Tecnologías** (`components/sections/Technologies.tsx`, array `TECH`).
  4. **Logos de clientes** (`components/sections/Services.tsx`, array `LOGOS`).

Objetivo: **el CMS es la única fuente de verdad** para portafolio y logos, y una
pasada de calidad visual. Single-tenant, mismo stack (Next.js + Prisma + Postgres +
MinIO en Docker), mismos patrones que CMS/LMS/portal.

## Patrones a reutilizar (idénticos a lo ya construido)

- **Lectura con override + fallback:** `safeQuery(fn, fallback)` (lib/content/safe);
  el contenido del código es el fallback, la DB solo guarda lo gestionado. Cero
  regresión si la DB está vacía/caída.
- **ISR + revalidación on-demand:** las server actions del admin llaman
  `revalidatePath('/[locale]', 'layout')` tras mutar.
- **Admin CRUD:** `(protected)/<area>/{page,[id]/page,new/page,_form}.tsx` +
  `_actions/<area>.ts` (`"use server"` + `requireAdmin` + zod + revalidate) +
  link en `_nav.tsx`. Referencia directa: `/admin/portfolio`.
- **Migraciones seguras:** columnas nuevas y tablas nuevas con defaults son
  `ALTER TABLE ADD` / `CREATE TABLE` — sin el problema de "enum value como default"
  que apareció en el LMS (no se añaden valores de enum nuevos aquí).

## Decisiones cerradas (aprobadas)

1. **Bento sin editor de layout manual.** Se arma automáticamente desde `featured` +
   `sortOrder`; los slots visuales (a–e) se asignan por orden. Un editor de slots
   sería mucho más complejo por poco valor.
2. **Un solo modelo `Logo`** para marcas y tecnologías (group BRAND|TECH); son
   estructuralmente idénticos (lista ordenada de nombre + imagen).
3. **Migraciones:** M1 añade columnas a `Project`; M2 crea tabla `Logo`. Ambas seguras.

---

## M1 — Portafolio como única fuente de verdad *(commit 1)*

### Esquema (migración `portfolio_featured`)
Añadir a `model Project`:
```prisma
featured  Boolean @default(false)   // aparece en bento del home + megamenú
accent    String?                   // color de acento (#hex) para tarjeta/bento
icon      String?                   // clave de ícono (users|house|cap|gamepad|leaf|…)
// sortOrder ya existe
```

### Comportamiento
- **Loader:** extender `mapRowToProject` para exponer `featured`, `accent`, `icon`
  (con defaults seguros). `getAllProjectsAsync()` ya ordena por `sortOrder asc`.
- **Bento del home** (`Portfolio.tsx` pasa a recibir `projects: Project[]` desde el
  server component `app/(site)/[locale]/page.tsx`): tomar los `featured` (o los
  primeros N si no hay suficientes), asignar áreas `a–e` por orden, mapear campos:
  `name = locale.name || locale.title`, `desc = locale.short`,
  `features = highlights.slice(0,3)`, `stack = tags`, `accent`, `icon`, `cat`.
  El primer destacado ocupa el slot grande (`featured` visual). Conservar el markup
  y las clases `pf2-*` actuales (la presentación no cambia, solo la fuente de datos).
- **Megamenú FEATURED** (`Header.tsx`): el layout server (`app/(site)/[locale]/layout.tsx`)
  carga los proyectos `featured` (top ~4) y se los pasa al `Header` como prop
  (el Header ya es client; recibe data serializable, no llama a la DB). Fallback al
  array actual si no hay datos.
- **Hub + relacionados:** ya leen de la DB (hecho en commits previos). El `name`
  corto ya existe.

### Admin
- `portfolio/_form.tsx`: añadir checkbox **Destacado** (`featured`), campo **Acento**
  (`accent`, #hex) y **Ícono** (`icon`, `<select>` con las claves disponibles).
- `_actions/portfolio.ts` (`saveProject`): leer y persistir los 3 campos (zod opcional).
- Páginas `[slug]/page.tsx` y `new/page.tsx`: incluir los campos en `ProjectInitial`.

### Archivos M1
- Modificar: `prisma/schema.prisma`, `lib/content/portfolio.ts`,
  `components/sections/Portfolio.tsx`, `app/(site)/[locale]/page.tsx`,
  `components/layout/Header.tsx`, `app/(site)/[locale]/layout.tsx`,
  `app/(admin)/admin/(protected)/portfolio/{_form,[slug]/page,new/page}.tsx`,
  `app/(admin)/admin/_actions/portfolio.ts`.
- Seed/DB: marcar `featured` + `accent` + `icon` en los proyectos existentes para
  reproducir la bento/megamenú actuales (script de merge sobre filas, como el de
  `name` corto; sin clobber de otros campos).

---

## M2 — Logos editables (marcas + tecnologías) *(commit 2)*

### Esquema (migración `logos`)
```prisma
enum LogoGroup { BRAND TECH }

model Logo {
  id        String    @id @default(cuid())
  name      String
  image     String              // ruta/URL (puede venir de la biblioteca de medios)
  group     LogoGroup
  sortOrder Int       @default(0)
  published Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  @@index([group])
}
```

### Comportamiento
- `lib/content/logos.ts`: `getLogosAsync(group)` con `safeQuery` y fallback a los
  arrays actuales (extraídos a constantes de datos).
- **Services strip** (`Services.tsx`): la lista de logos de clientes pasa a
  `getLogosAsync("BRAND")` (la sección Services del home se alimenta desde el server).
- **Technologies** (`Technologies.tsx`): la lista pasa a `getLogosAsync("TECH")`.
  Las imágenes siguen pudiendo resolverse por `MediaSlot` si el `image` apunta a un
  slot; por defecto el `image` del registro.

### Admin
- `/admin/logos`: lista con dos grupos (Marcas / Tecnologías), alta/edición/borrado,
  orden y publicado; reusar `MediaField` (biblioteca de medios) para la imagen.
- `_actions/logos.ts`: `saveLogo`, `deleteLogo`, `reorderLogo?` (`requireAdmin` +
  revalidate). Link "Logos" en `_nav.tsx`.
- Seed: 7 marcas + 8 tecnologías actuales.

### Archivos M2
- Crear: `lib/content/logos.ts`, `lib/content/logos.data.ts` (fallback),
  `app/(admin)/admin/(protected)/logos/{page,_form}.tsx`,
  `app/(admin)/admin/_actions/logos.ts`.
- Modificar: `prisma/schema.prisma`, `components/sections/{Services,Technologies}.tsx`,
  `app/(admin)/admin/(protected)/_nav.tsx`, seed.

---

## M3 — Pulido visual + responsive *(commit 3)*

- **Hub `/portafolio`**: alinear las tarjetas al UI estándar de las landing de
  servicio (mismo lenguaje visual de `svc-rcase`/tarjetas), encabezado consistente.
- **Bento**: revisar la versión data-driven (espaciados, truncados, hover) ahora que
  el contenido es variable.
- **Consistencia**: tarjetas (radios, sombras, foco), `alt` significativos en
  imágenes, animaciones `Reveal` coherentes entre secciones.
- **Responsive**: pasada de breakpoints móviles en home (Services strip, bento,
  Technologies) y hub.
- Sin cambios de datos; solo CSS/markup. Verificación visual con capturas a 1440 y 390 px.

---

## Gotchas

- **Docker/Windows — rutas nuevas:** `/admin/logos` es ruta nueva → tras crearla,
  `docker compose exec web sh -c "rm -rf .next/*"` + `restart` (Turbopack reusa el
  manifest del volumen; reiniciar solo no basta).
- **Header es client:** NO debe llamar a la DB; recibe los featured como prop desde
  el layout server. Mantener `Header` serializable.
- **Fallbacks:** todo lector nuevo usa `safeQuery(fn, <array de código>)` → el build
  y el sitio funcionan sin DB.
- **DB ya poblada:** los proyectos existen en DB; M1 actualiza filas con un script de
  merge (no re-seed que clobbere ediciones del admin hechas durante la auditoría).
- **Migraciones:** correr con `docker compose exec -T web npx prisma migrate dev`
  + `npx prisma generate` en host.

## Verificación (end-to-end, chrome-devtools)

- **M1:** marcar/desmarcar `featured` y cambiar `accent`/`icon` en `/admin/portfolio`
  → se refleja en bento del home y en el FEATURED del megamenú; reordenar cambia el
  layout del bento; hub/relacionados intactos. `lint`+`tsc`+`build` limpios.
- **M2:** crear/editar/ocultar un logo en `/admin/logos` (grupo BRAND y TECH) → se
  refleja en el strip de Services y en Technologies; orden respetado.
- **M3:** capturas a 1440 y 390 px del home y del hub; sin solapes ni desbordes;
  consola sin errores.

## Fuera de alcance

- Editor de layout manual del bento (slots a mano).
- Cablear `SocialProof`/`Testimonials` (componentes sin uso).
- Notificaciones por email, pagos Stripe, deploy a producción (decisiones aparte).
- Contenido real del cliente (logo, NAP, reviews, validación de claims).

## Relacionado
Memoria: `alrit-admin-lms-payments`, `alrit-dev-project`, `alrit-dev-style-conventions`.
