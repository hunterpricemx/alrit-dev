# Spec — Blog / Artículos (CMS, SEO)

Fecha: 2026-06-24 · Estado: diseño aprobado + **endurecido con revisión adversarial** (5 lentes), pendiente de plan.

## Contexto

El sitio ya anuncia "Blog · próximamente" en el megamenú (`m.blogCats`, badges `blogSoon`).
El footer **no** enlaza al blog (la clave `footer.company.blog` existe en los diccionarios pero
está sin usar). Construir el blog real es el siguiente subsistema: apoya el **SEO agresivo** del
proyecto, es autocontenido y reusa los patrones de CMS/LMS/portal (Prisma + `safeQuery` + admin
CRUD + ISR + i18n + biblioteca de medios). Single-tenant, mismo stack en Docker.

## Decisiones cerradas (aprobadas)

1. **Cuerpo en Markdown** (render a React con `react-markdown` + `remark-gfm`; sin HTML crudo).
2. **Bilingüe ES/EN con fallback** campo por campo; si EN está vacío, `/en` usa el ES.
3. **Categorías fijas** en código: `desarrollo-web`, `seo`, `ecommerce`, `negocio`.
4. **Ruta `/blog`** (slug en inglés) — excepción consciente a la convención de slugs ES del sitio
   (`/portafolio`, `/servicios`, `/cursos`); funciona porque hreflang apunta `/es/blog` y `/en/blog`
   a la misma ruta cambiando solo el prefijo de locale.

## Resoluciones de la revisión adversarial (incorporadas abajo)

- **Identidad del Post = id estable** (patrón Courses), NO upsert por slug → renombrar slug no duplica (crítico para SEO).
- **`/blog` (índice) lleva su propio `generateMetadata`** → si no, se auto-canonicaliza a la home.
- **Filtro client con `useSearchParams` → envuelto en `<Suspense>`** o `next build` falla (Next 16, cacheComponents OFF).
- **`updatedAt` expuesto** en el tipo Post → `dateModified`/`og:modified_time` reales.
- **hreflang condicional**: posts solo-ES no emiten alternate `en` (no mentir a Google).
- Validaciones zod (slug regex, category enum, longitudes), orden `nulls:'last'`, fechas ISO/UTC,
  JSON-LD correcto (image absoluta, author Person, publisher por `@id`, inLanguage `es-MX/en-US`,
  BreadcrumbList), sitemap con `lastModified` por post, nav móvil + footer, claves de diccionario.

## Patrones a reutilizar

- **Override + fallback**: `safeQuery(fn, [])`; el blog arranca vacío → muestra `emptyState`.
- **ISR**: páginas públicas `export const revalidate = 3600`; admin con `revalidatePath('/[locale]','layout')`.
- **Admin CRUD id-estable**: referencia correcta = **Courses** (`app/(admin)/admin/_actions/courses.ts`),
  NO Portfolio (que tiene el bug latente de upsert-por-slug).
- **Contenido bilingüe en `locales` Json** `{es,en}` (como Project) con normalización a objeto vacío y fallback EN→ES.
- **Header client recibe `latestPosts` por prop** desde el layout server (igual que `featured`).
- **SEO**: `lib/seo/jsonld.tsx` (añadir `BlogPostingJsonLd`; reusar `BreadcrumbJsonLd`), `app/sitemap.ts`, `app/robots.ts`, `generateMetadata` por página.
- **CSS por módulo**: `app/blog-x.css` importado en `globals.css`.

---

## M0 — Cimientos

### Esquema (migración `blog`)
```prisma
model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  category    String    // key de BLOG_CATEGORIES (validado en el action)
  cover       String?   // ruta/URL (biblioteca de medios)
  author      String    @default("Equipo Alrit")
  locales     Json      // { es:{title,excerpt,body}, en:{title,excerpt,body} } — body = Markdown
  published   Boolean   @default(false)
  publishedAt DateTime? // fecha de publicación (orden + display)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([published, publishedAt])
  @@index([category, published, publishedAt])
}
```

### `lib/content/blog-categories.ts`
```ts
export type BlogCategory = { key: string; es: string; en: string };
export const BLOG_CATEGORIES: BlogCategory[] = [
  { key: "desarrollo-web", es: "Desarrollo web", en: "Web development" },
  { key: "seo",            es: "SEO y posicionamiento", en: "SEO" },
  { key: "ecommerce",      es: "E-commerce", en: "E-commerce" },
  { key: "negocio",        es: "Negocio digital", en: "Digital business" },
];
export const BLOG_CATEGORY_KEYS = BLOG_CATEGORIES.map((c) => c.key);
export function categoryLabel(key: string, locale: "es" | "en"): string; // fallback al key
```

### `lib/content/blog.ts`
```ts
export type PostLocaleContent = { title: string; excerpt: string; body: string };
export type Post = {
  slug: string; category: string; cover: string | null; author: string;
  es: PostLocaleContent; en: PostLocaleContent;
  published: boolean;
  publishedAt: string | null;  // ISO normalizado en el loader (Date → toISOString)
  updatedAt: string;           // ISO — para dateModified
  hasEn: boolean;              // en.title && en.body no vacíos → emitir alternate hreflang en
};
```
Loaders (todos `safeQuery(..., [])`):
- `getPublishedPostsAsync()` — `where:{published:true}`, `orderBy:{ publishedAt:{ sort:"desc", nulls:"last" } }`.
- `getPostBySlugAsync(slug)` — `findUnique`, devuelve `undefined` si no existe o no publicado.
- `getAllPostSlugs()` — `[{slug, updatedAt, publishedAt}]` para sitemap + `generateStaticParams` (solo published).
- `getLatestPostsAsync(n)` — para el megamenú (published, desc nulls-last, take n).
- `postLocale(post, locale)` — fallback **campo por campo**: si `post[locale][campo].trim()===""` usa `post.es[campo]`.
- `readingTime(body)` — `Math.max(1, round(words/200))`. Se invoca con el body **del locale ya resuelto**.

Mapper `mapRowToPost(row)` (espejo de `mapRowToProject`): normaliza `es/en` a `{title:"",excerpt:"",body:""}` si faltan; `publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null`; `updatedAt: row.updatedAt.toISOString()`; `hasEn = (loc.en?.title||"").trim()!=="" && (loc.en?.body||"").trim()!==""`.

### Render Markdown
- Dependencia: `react-markdown` + `remark-gfm`. **Verificado**: react-markdown ≥9 declara peer `react >=18` → compatible con React 19.2.4 sin conflicto; es síncrono y renderiza bien como **Server Component**. (Se descarta el plan B de `marked` — no hay conflicto de peer-deps.)
- `components/blog/Markdown.tsx` (Server Component): `<ReactMarkdown remarkPlugins={[remarkGfm]}>` con wrapper `className="article__body"`. **Sin `rehype-raw`** → no ejecuta HTML embebido (seguro). Importar solo en este Server Component (ESM puro + Turbopack).
- Instalar dentro y fuera del contenedor: `docker compose exec web npm i react-markdown remark-gfm` + `npm i` en host (tipos).

### CSS — `app/blog-x.css`
Tipografía del artículo (`.article__body h2/h3/p/ul/ol/blockquote/pre/code/img/a/table`), tarjetas (`.blog-card`), hero (`.blog-hub`), filtro (`.blog-filter`, tab activa `aria-current`). El body Markdown empieza en **h2** (h1 = título del post).

---

## M1 — Admin (id-estable)

- `app/(admin)/admin/(protected)/blog/{page,new/page,[id]/page,_form}.tsx`:
  - **Lista**: posts (título ES, categoría, estado publicado/borrador, fecha) → enlazan a **`/admin/blog/${p.id}`** (id, no slug); botón "Nuevo".
  - **`[id]/page.tsx`**: `db.post.findUnique({ where:{ id } })`; arma `PostInitial` (incluye `id`); `notFound()` si no existe.
  - **`_form`** (client, `useActionState`): `<input type="hidden" name="id">`, `slug`, `category` (`<select>` de `BLOG_CATEGORIES`), `cover` (MediaField/biblioteca), `author`, `publishedAt` (`<input type="date">`), `published` (checkbox), y por idioma: `title`, `excerpt` (textarea corto), **`body` (textarea grande, Markdown)** con hint.
- `app/(admin)/admin/_actions/blog.ts` (`requireAdmin` + zod). Importado por `_form` como `../../_actions/blog`:
  - `savePost(prev, formData)`: zod `{ slug: regex(/^[a-z0-9-]+$/), category: enum(BLOG_CATEGORY_KEYS), title ≤110, excerpt ≤180, body string, author }`. Identidad **id-estable**: `const id = str("id"); if (id) update({where:{id}}) else create()` — **NO upsert por slug**. `publishedAt`: si `published` y vacío → hoy (mediodía UTC: `new Date(d+"T12:00:00Z")`); si viene del input date, parsear como `T12:00:00Z`. Captura violación de `@unique(slug)` en try/catch → "¿slug duplicado?". `revalidatePath('/[locale]','layout')`.
  - `deletePost(id)`, `togglePublished(id, v)`.
- Link "Blog" en `_nav.tsx` (entre Logos y Textos) + ícono.

---

## M2 — Blog público + SEO

### `app/(site)/[locale]/blog/page.tsx` (ISR, `revalidate=3600`)
- Server: `getPublishedPostsAsync()` → pasa todos al cliente. Hero (`dict.blog.*`).
- **`generateMetadata` PROPIO** (si no, hereda el canonical de la home): `title` "Blog | Alrit.dev", `description` = `dict.blog.text`, `alternates.canonical` `/${locale}/blog` + `languages {es,en,'x-default':'/es/blog'}`, `openGraph` type `website`.
- **`<Suspense fallback={…}>`** envolviendo `<BlogFilter posts=… />` (obligatorio por `useSearchParams`; el fallback puede ser el grid sin filtrar).
- `components/blog/BlogFilter.tsx` (client): tabs `[Todas, …BLOG_CATEGORIES]`; lee `?cat=` con `useSearchParams`; **valida** cat contra `BLOG_CATEGORY_KEYS` → si inválida, "Todas"; marca la tab activa (`aria-current`). Grid de `.blog-card` (portada con `alt`=título, categoría, título, extracto, fecha localizada, `readingTime`+`dict.blog.minRead`). Si la cat válida no tiene posts o no hay posts → `emptyState`.

### `app/(site)/[locale]/blog/[slug]/page.tsx` (ISR + `generateStaticParams`)
- Firma idéntica a `cursos/[slug]`: `await params`, `generateStaticParams` = `getAllPostSlugs().flatMap` sobre locales, `revalidate=3600`. `notFound()` si no publicado.
- Render: cabecera (categoría, **h1**=título, autor con `dict.blog.authorBy`, fecha, lectura), portada (`alt`=título), `<Markdown>` del body resuelto, **relacionados** (misma categoría, excluye actual, máx 3).
- `generateMetadata`: `title` `${title} | Alrit.dev` (≤110 efectivo), `description` = excerpt (si vacío, primeros ~155 chars del body sin Markdown), `alternates.canonical` `/${locale}/blog/${slug}`, `languages`: **siempre `es` + `x-default:/es/...`; añade `en` SOLO si `post.hasEn`**. `openGraph` type `article`, `publishedTime`=publishedAt, `modifiedTime`=updatedAt, `locale` `es_MX|en_US`, `images:[cover absoluto]` (si hay cover). `twitter summary_large_image`.
- Emitir `BlogPostingJsonLd` + `BreadcrumbJsonLd` (Inicio > Blog > título).

### Diccionario — bloque `blog` (ES y EN, mismas claves o tsc falla)
`{ eyebrow, title, text, allCategories ("Todas"/"All"), filterLabel, readMore, relatedTitle, minRead ("min de lectura"/"min read"), authorBy ("Por"/"By"), emptyState, backToBlog }`.

### SEO — `lib/seo/jsonld.tsx` → `BlogPostingJsonLd`
`@type BlogPosting`; `headline` (título, truncado ≤110); `description` (excerpt); `image` = `cover.startsWith("http")?cover:`${SITE_URL}${cover}`` (omitir el campo si no hay cover); `datePublished`=publishedAt; `dateModified`=**updatedAt**; `author` `{ "@type":"Person", name: post.author }`; `publisher` `{ "@id": "${SITE_URL}/#organization" }` (referencia al nodo de `OrganizationJsonLd` que ya emite el layout — patrón de `CaseStudyJsonLd`); `mainEntityOfPage` URL del post; `inLanguage` `es-MX|en-US`. *(Nota: `OrganizationJsonLd` aún no tiene `logo` image porque no hay asset de logo real — pendiente de contenido del cliente; el JSON-LD es válido sin él.)*

### SEO — `app/sitemap.ts`
- Añadir `/blog` (weekly, 0.7). Para cada post: entrada `/blog/${slug}` con **`lastModified` = updatedAt||publishedAt** (no el `LAST` hardcodeado). Para esto `getAllPostSlugs` devuelve `{slug, updatedAt, publishedAt}` y el sitemap construye la entrada por post (no reusa `entry()` con `LAST`). Las URLs `?cat=` NO se listan (son query params, no rutas).

### SEO — `app/robots.ts`
Añadir `disallow: "/admin"` (las páginas admin no deben crawlearse; mejora preexistente que el blog aprovecha).

### Cableado
- **Megamenú** (`Header.tsx`): el panel `blog` deja de ser "próximamente". Importa `BLOG_CATEGORIES`/`categoryLabel` (constantes TS, seguras en client); lista categorías como links `/blog?cat=${key}` con `categoryLabel(key, locale)`; muestra **últimos posts** (cards portada/título desde prop `latestPosts`). Deja de usar `m.blogCats`/`m.blogSoon` (claves muertas; el CSS `.mega-soon`/`.mega--blog` se re-estiliza para cards). El layout server carga `getLatestPostsAsync(3)` y lo pasa como `latestPosts` (data plana `{slug,title,cover,category}`).
- **Nav móvil** (drawer de `Header.tsx`): añadir `<Link href={`${base}/blog`} className="drawer__sec">{dict.nav.blog}</Link>` (entre Cursos y Calculadora) — sin esto el blog es inaccesible en móvil salvo footer.
- **Footer** (`Footer.tsx`): añadir en la columna "company" `<Link href={`${base}/blog`}>{dict.footer.company.blog}</Link>` (reusa la clave existente sin usar).

---

## Gotchas

- **`useSearchParams` ⇒ `<Suspense>`** o `next build` falla ("Missing Suspense boundary") — único hook con bailout; el repo no lo usaba antes. La verificación DEBE incluir `next build` limpio.
- **Identidad id-estable** (no upsert por slug) — evita posts duplicados al renombrar slug (riesgo SEO).
- **Fechas**: loader normaliza `DateTime→ISO`; admin guarda `publishedAt` como mediodía UTC; display con `Intl.DateTimeFormat(locale, { timeZone:"UTC", day:"2-digit", month:"long", year:"numeric" })` (evita corrimiento de día). Mostrar fecha solo si `publishedAt!==null`.
- **hreflang condicional**: emitir alternate `en` solo si `post.hasEn` (posts solo-ES no mienten a Google).
- **Header serializable**: `latestPosts` data plana, no filas Prisma.
- **Rutas nuevas anidadas** (`/blog`, `/blog/[slug]`, `/admin/blog`): tras crearlas, `docker compose exec web sh -c "rm -rf .next/*"` + `restart`.
- **`generateStaticParams` con DB**: `safeQuery(…, [])` (válido sin cacheComponents, que está OFF).
- **react-markdown** sin `rehype-raw` (seguro); importar solo en el Server Component `Markdown.tsx`.

## Verificación (end-to-end, chrome-devtools)

1. **M0/M1**: migración + `npm i` ok; crear 2 posts demo (uno bilingüe con portada, otro solo-ES, categorías distintas); publicar uno, dejar el otro en borrador. Editar el slug de un post existente y confirmar que **NO** se duplica (mismo id).
2. **M2**: `/blog` lista solo publicados; filtro por categoría funciona y `?cat=inválida` cae a "Todas"; `/blog/[slug]` renderiza Markdown (h2/listas/código/enlaces/imagen), autor/fecha/lectura y relacionados; el borrador da 404.
3. **SEO**: `/blog` y `/blog/[slug]` tienen canonical/hreflang correctos (índice NO canonicaliza a home; post solo-ES no emite `en`); `BlogPosting` + `BreadcrumbList` válidos (Rich Results); `/sitemap.xml` incluye `/blog` y el post con su `lastModified`. **`next build` limpio** (Suspense ok).
4. **Cableado**: megamenú "Blog" con categorías (deep-link `?cat=` filtra) + últimos posts; drawer móvil con Blog; footer con Blog.
5. **Calidad**: `/en/blog/[slug]` usa fallback ES donde falte EN; responsive 1440/390px; consola limpia; `lint`+`tsc`+`build` limpios.
6. **Limpieza**: tras verificar, dejar los posts demo como **borrador** o eliminarlos (producción arranca vacía con `emptyState`).

## Fuera de alcance (v1)

Comentarios; RSS/Atom; editor visual o preview en vivo; resaltado de sintaxis; perfiles de autor; tags; búsqueda full-text; programación automática de publicación; logo real del publisher (pendiente de contenido del cliente).

## Relacionado
Memorias: `alrit-dev-project`, `alrit-dev-style-conventions` (SEO agresivo), `alrit-admin-lms-payments`.
