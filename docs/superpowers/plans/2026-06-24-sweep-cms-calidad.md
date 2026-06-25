# Sweep CMS + calidad — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer del CMS la única fuente de verdad del portafolio (bento del home + FEATURED del megamenú, además del hub y relacionados que ya lo son) y de los logos (marcas + tecnologías), más una pasada de calidad visual.

**Architecture:** Patrón override+fallback con `safeQuery` (el contenido del código es el fallback; la DB guarda lo gestionado). Componentes server cargan datos y los pasan como props a los componentes client (Header, Services, Portfolio). Admin CRUD con server actions (`requireAdmin` + zod + `revalidatePath`). ISR con revalidación on-demand.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Prisma + Postgres, MinIO, Tailwind v4 + CSS BEM. Todo en Docker (`web`, `db`, `minio`).

## Global Constraints

- **Sin tests automatizados:** el proyecto no tiene framework de tests. Verificación = `npm run lint` + `npx tsc --noEmit` + `npm run build` + verificación visual con chrome-devtools. Cada tarea cierra con estos checks + commit.
- **Fallbacks obligatorios:** todo lector nuevo usa `safeQuery(fn, <constante de código>)`; build y sitio deben funcionar sin DB.
- **Header es client:** NO debe llamar a la DB; recibe datos serializables como prop desde el layout server.
- **Migraciones:** `docker compose exec -T web npx prisma migrate dev --name <n>` y luego `npx prisma generate` en host. Sin añadir valores a enums existentes (evita el problema `55P04`).
- **Rutas nuevas en Docker/Windows:** tras crear una ruta, `docker compose exec web sh -c "rm -rf .next/*"` + `docker compose restart web` (Turbopack reusa el manifest del volumen).
- **DB ya poblada:** los 7 proyectos existen en DB; actualizar con scripts de merge sobre filas (no re-seed que clobbere ediciones).
- **Commits:** terminan con la línea `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Idioma:** UI del sitio ES/EN vía diccionario; el admin es ES.

---

## M1 — Portafolio como única fuente de verdad

### Task 1: Esquema `Project` (featured/accent/icon) + loader + módulo de íconos

**Files:**
- Modify: `prisma/schema.prisma` (model `Project`)
- Create: `lib/content/portfolio-icons.ts`
- Modify: `lib/content/portfolio.ts` (tipo `Project`, `mapRowToProject`)

**Interfaces:**
- Produces: `Project.featured: boolean`, `Project.accent: string` (`""` si no), `Project.icon: string` (`""` si no); `PORTFOLIO_ICONS: Record<string,string>`, `PORTFOLIO_ICON_KEYS: string[]`.

- [ ] **Step 1: Añadir columnas al modelo Project**

En `prisma/schema.prisma`, dentro de `model Project`, después de `sortOrder Int @default(0)`:
```prisma
  featured       Boolean  @default(false)
  accent         String?
  icon           String?
```

- [ ] **Step 2: Crear el módulo compartido de íconos**

Crear `lib/content/portfolio-icons.ts` (paths copiados de los `ICONS` actuales de `components/sections/Portfolio.tsx`):
```ts
export const PORTFOLIO_ICONS: Record<string, string> = {
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  house: "M4 11 12 4l8 7M6 10v9h12v-9M10 19v-5h4v5",
  cap: "M3 7l9-4 9 4-9 4-9-4Zm3 2v5c0 1.7 2.7 3 6 3s6-1.3 6-3V9",
  gamepad: "M6 12h4m-2-2v4M15 11h.01M18 13h.01M17.3 5H6.7a4 4 0 0 0-3.98 3.59L2 14a3 3 0 0 0 5.4 2.1L8 15h8l.6 1.1A3 3 0 0 0 22 14l-.72-5.41A4 4 0 0 0 17.3 5Z",
  leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.52-4.48 10-10 10ZM2 21c0-3 1.85-5.36 5.08-6",
  cart: "M6 6h15l-1.5 9h-12zM6 6 5 3H2m4 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm11 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
  phone: "M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm3 18h4",
};

export const PORTFOLIO_ICON_KEYS = Object.keys(PORTFOLIO_ICONS);

/** Ícono por defecto según categoría, cuando el proyecto no tiene uno. */
export function iconForCat(cat: string): string {
  if (cat === "realestate") return "house";
  if (cat === "lms") return "cap";
  return "users";
}
```

- [ ] **Step 3: Extender el tipo `Project` y el loader**

En `lib/content/portfolio.ts`, añadir a `type Project` (después de `tags: string[];`):
```ts
  featured: boolean;
  accent: string;
  icon: string;
```
Añadir a `type ProjectRow` (después de `tags: unknown;`):
```ts
  featured?: boolean;
  accent?: string | null;
  icon?: string | null;
```
En `mapRowToProject`, antes del `};` final del `return`, añadir:
```ts
    featured: row.featured ?? false,
    accent: row.accent ?? "",
    icon: row.icon ?? "",
```
En el fallback JSON (`PROJECTS = data as Project[]`), los objetos del JSON no tienen estos campos; añadir defaults al castear:
```ts
const PROJECTS = (data as Omit<Project, "featured" | "accent" | "icon">[]).map((p) => ({
  ...p,
  featured: false,
  accent: "",
  icon: "",
})) as Project[];
```

- [ ] **Step 4: Generar la migración**

```bash
docker compose exec -T web npx prisma migrate dev --name portfolio_featured
npx prisma generate
```
Expected: "Your database is now in sync with your schema." + "Generated Prisma Client".

- [ ] **Step 5: Lint + typecheck**

```bash
npm run lint && npx tsc --noEmit
```
Expected: sin salida de error.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(portfolio): campos featured/accent/icon en Project + módulo de íconos"
```

---

### Task 2: Editor admin — campos Destacado/Acento/Ícono

**Files:**
- Modify: `app/(admin)/admin/(protected)/portfolio/_form.tsx`
- Modify: `app/(admin)/admin/_actions/portfolio.ts`
- Modify: `app/(admin)/admin/(protected)/portfolio/[slug]/page.tsx`
- Modify: `app/(admin)/admin/(protected)/portfolio/new/page.tsx`

**Interfaces:**
- Consumes: `PORTFOLIO_ICON_KEYS` (Task 1).
- Produces: `ProjectInitial` gana `featured: boolean`, `accent: string`, `icon: string`; `saveProject` persiste esos campos.

- [ ] **Step 1: Añadir los campos a `ProjectInitial` y al formulario**

En `_form.tsx`, añadir a `ProjectInitial` (después de `sortOrder: number;`):
```ts
  featured: boolean;
  accent: string;
  icon: string;
```
Importar los íconos al inicio:
```ts
import { PORTFOLIO_ICON_KEYS } from "@/lib/content/portfolio-icons";
```
En el `adm-form__grid` (junto a los otros `Field`), añadir el acento y el ícono:
```tsx
        <Field label="Acento (bento)" name="accent" defaultValue={initial.accent} hint="#hex" />
        <label className="adm-field">
          <span className="adm-field__label">Ícono (bento)</span>
          <select className="adm-input" name="icon" defaultValue={initial.icon}>
            <option value="">— por categoría —</option>
            {PORTFOLIO_ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
```
Y junto al checkbox "Publicado", añadir el de destacado:
```tsx
      <label className="adm-check">
        <input type="checkbox" name="featured" defaultChecked={initial.featured} /> Destacado (home + megamenú)
      </label>
```

- [ ] **Step 2: Persistir en `saveProject`**

En `app/(admin)/admin/_actions/portfolio.ts`, después de `const sortOrder = ...`:
```ts
  const featured = formData.get("featured") === "on";
  const accent = str(formData.get("accent"));
  const icon = str(formData.get("icon"));
```
Cambiar la línea `const data = { ...parsed.data, locales, highlights, tags, published, sortOrder };` por:
```ts
  const data = { ...parsed.data, locales, highlights, tags, published, sortOrder, featured, accent, icon };
```

- [ ] **Step 3: Pasar los campos en las páginas que arman `ProjectInitial`**

En `portfolio/[slug]/page.tsx`, dentro de `const initial`, después de `sortOrder: p.sortOrder,`:
```ts
    featured: p.featured,
    accent: p.accent ?? "",
    icon: p.icon ?? "",
```
En `portfolio/new/page.tsx`, en `const EMPTY`, después de `sortOrder: 0,`:
```ts
  featured: false,
  accent: "",
  icon: "",
```

- [ ] **Step 4: Lint + typecheck + build**

```bash
npm run lint && npx tsc --noEmit && npm run build
```
Expected: build OK, sin errores.

- [ ] **Step 5: Verificación visual**

Reiniciar web (`docker compose restart web`; esperar "Ready in"). En chrome-devtools: ir a `/admin/portfolio/<un-slug>`, confirmar que aparecen los campos Acento, Ícono (select) y el checkbox Destacado; marcar Destacado + poner `#8a6bff` + icono `users`, guardar, recargar y confirmar que persistió.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin/portfolio): campos Destacado/Acento/Ícono en el editor"
```

---

### Task 3: Bento del home desde la DB

**Files:**
- Modify: `components/sections/Portfolio.tsx`
- Modify: `app/(site)/[locale]/page.tsx`

**Interfaces:**
- Consumes: `getAllProjectsAsync()` (existente), `Project` con `featured/accent/icon` (Task 1), `PORTFOLIO_ICONS`/`iconForCat` (Task 1).
- Produces: `Portfolio` recibe `projects: Project[]` además de `dict`, `locale`.

- [ ] **Step 1: Refactorizar `Portfolio.tsx` para recibir proyectos**

Reemplazar el array `BENTO` y el bloque `ICONS` por imports y derivación. Encabezado del archivo:
```tsx
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Project } from "@/lib/content/portfolio";
import { PORTFOLIO_ICONS, iconForCat } from "@/lib/content/portfolio-icons";
import Reveal from "@/components/ui/Reveal";

const AREAS = ["a", "b", "c", "d", "e"] as const;
const ACCENTS = ["#e84393", "#00b894", "#8a6bff", "#ff4d6d", "#fb8c2e"];
```
Cambiar la firma y construir los ítems (hasta 5; destacados primero):
```tsx
export default function Portfolio({
  dict,
  locale,
  projects,
}: {
  dict: Dictionary;
  locale: Locale;
  projects: Project[];
}) {
  const p = dict.portfolio;
  const ordered = [...projects].sort(
    (a, b) => Number(b.featured) - Number(a.featured),
  );
  const items = ordered.slice(0, 5).map((proj, i) => ({
    slug: proj.slug,
    area: AREAS[i],
    accent: proj.accent || ACCENTS[i],
    iconPath: PORTFOLIO_ICONS[proj.icon || iconForCat(proj.cat)] ?? PORTFOLIO_ICONS.users,
    image: proj.image,
    name: proj[locale].name || proj[locale].title,
    cat: proj.cat,
    featured: i === 0,
    desc: proj[locale].short,
    features: proj.highlights.slice(0, 3),
    stack: proj.tags,
  }));
```
En el `.map(BENTO...)` del JSX, cambiar a `items.map((b, i) => {...})` y dentro:
- `const features = b.features;` (ya es `string[]`, sin `[locale]`).
- `--accent` usa `b.accent`.
- `<path d={b.iconPath} />` en el ícono.
- Quitar el bloque `nameAccent` (ya no existe): el nombre queda solo `{b.name}`.
- `{b.desc}` en vez de `{b.desc[locale]}`.
- `{b.stack.join(" · ")}` igual.

- [ ] **Step 2: Cargar proyectos en el home y pasarlos**

En `app/(site)/[locale]/page.tsx`, importar el loader:
```ts
import { getAllProjectsAsync } from "@/lib/content/portfolio";
```
Añadir a `Promise.all`:
```ts
  const [dict, pricing, slotMap, projects] = await Promise.all([
    getDictionaryAsync(l),
    getPricingAsync(),
    getSlotMap(),
    getAllProjectsAsync(),
  ]);
```
Cambiar el render:
```tsx
      <Portfolio dict={dict} locale={l} projects={projects} />
```

- [ ] **Step 3: Lint + typecheck + build**

```bash
npm run lint && npx tsc --noEmit && npm run build
```
Expected: build OK.

- [ ] **Step 4: Verificación visual**

`docker compose restart web`. En chrome-devtools abrir `/es`, bajar a la bento; confirmar que muestra proyectos (los destacados marcados en Task 2 aparecen primero, el primero en el slot grande) con nombre corto, descripción, features y stack. Cambiar el orden/destacado de un proyecto en el admin y confirmar que la bento cambia tras recargar.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(home): bento de portafolio desde el CMS (antes array fijo)"
```

---

### Task 4: FEATURED del megamenú desde la DB

**Files:**
- Modify: `components/layout/Header.tsx`
- Modify: `app/(site)/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `getAllProjectsAsync()` (existente).
- Produces: `Header` recibe `featured: FeaturedItem[]` donde `FeaturedItem = { slug: string; name: string; image: string; cat: string }`.

- [ ] **Step 1: Tipar y consumir `featured` en el Header**

En `components/layout/Header.tsx`, eliminar el array `FEATURED` (líneas 16–21) y añadir el tipo arriba:
```ts
type FeaturedItem = { slug: string; name: string; image: string; cat: string };
```
Cambiar la firma:
```ts
export default function Header({ dict, locale, featured }: { dict: Dictionary; locale: Locale; featured: FeaturedItem[] }) {
```
En el bloque `open === "portfolio"`, el `.map` ya usa `FEATURED.map((p) => ...)`; cambiarlo a `featured.map((p) => ...)` (las propiedades `p.slug/p.image/p.name/p.cat` siguen igual).

- [ ] **Step 2: Cargar featured en el layout y pasarlos**

En `app/(site)/[locale]/layout.tsx`, importar el loader:
```ts
import { getAllProjectsAsync } from "@/lib/content/portfolio";
```
En `LocaleLayout`, después de `const dict = await getDictionaryAsync(...)`:
```ts
  const projects = await getAllProjectsAsync();
  const featured = projects
    .filter((p) => p.featured)
    .slice(0, 4)
    .map((p) => ({ slug: p.slug, name: p[locale as Locale].name || p[locale as Locale].title, image: p.image, cat: p.cat }));
  const featuredFallback = featured.length
    ? featured
    : projects.slice(0, 4).map((p) => ({ slug: p.slug, name: p[locale as Locale].name || p[locale as Locale].title, image: p.image, cat: p.cat }));
```
Cambiar el render del Header:
```tsx
          <Header dict={dict} locale={locale as Locale} featured={featuredFallback} />
```

- [ ] **Step 3: Lint + typecheck + build**

```bash
npm run lint && npx tsc --noEmit && npm run build
```
Expected: build OK.

- [ ] **Step 4: Verificación visual**

`docker compose restart web`. En chrome-devtools abrir `/es`, hover en "Portafolio" del nav; confirmar que el panel FEATURED muestra los proyectos destacados (top 4) con su imagen, categoría y nombre, y que el link lleva al case study correcto.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(header): FEATURED del megamenú desde el CMS (antes array fijo)"
```

---

### Task 5: Sembrar featured/accent/icon en las filas existentes

**Files:**
- (sin archivos de repo; script único contra la DB del contenedor)

**Interfaces:**
- Consumes: filas `Project` en DB (slugs existentes).

- [ ] **Step 1: Merge de presentación en las filas existentes**

Reproduce la bento/megamenú actuales: marca como `featured` los 5 que estaban en la bento y pon su acento/ícono. Ejecutar:
```bash
docker compose exec -T web node -e '
const {PrismaClient}=require("@prisma/client"); const db=new PrismaClient();
const P={
 "conectas-plataforma-experiencias-gastronomicas":{featured:true,accent:"#e84393",icon:"users"},
 "bdweb-plataforma-inmobiliaria":{featured:true,accent:"#00b894",icon:"house"},
 "programarte-plataforma-bienestar-mental":{featured:true,accent:"#8a6bff",icon:"cap"},
 "conquer-classic-plus":{featured:true,accent:"#ff4d6d",icon:"gamepad"},
 "bodhi-medicine-plataforma-formacion-salud-holistica":{featured:true,accent:"#fb8c2e",icon:"leaf"},
};
(async()=>{ for(const [slug,v] of Object.entries(P)){ const p=await db.project.findUnique({where:{slug}}); if(!p){console.log("skip",slug);continue;} await db.project.update({where:{slug},data:v}); console.log("ok",slug);} await db.$disconnect(); })();
'
```
Expected: `ok` por cada slug.

- [ ] **Step 2: Verificación visual end-to-end**

`docker compose restart web`. En chrome-devtools: `/es` → la bento muestra esos 5 con sus acentos; hover en "Portafolio" → FEATURED muestra los 4 primeros destacados. Cambiar `sortOrder` de uno en `/admin/portfolio` y confirmar que su posición cambia en bento y megamenú tras recargar.

- [ ] **Step 3: Sin commit (cambio de datos en DB, no de repo)**

Nota: este paso solo toca la DB. No hay archivos que commitear.

---

## M2 — Logos editables (marcas + tecnologías)

### Task 6: Modelo `Logo` + loader + datos de fallback

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/content/logos.data.ts`
- Create: `lib/content/logos.ts`

**Interfaces:**
- Produces: `type LogoItem = { name: string; image: string }`; `getLogosAsync(group: "BRAND" | "TECH"): Promise<LogoItem[]>`; constantes `BRAND_LOGOS`, `TECH_LOGOS`.

- [ ] **Step 1: Añadir enum y modelo**

En `prisma/schema.prisma` (al final):
```prisma
enum LogoGroup {
  BRAND
  TECH
}

model Logo {
  id        String    @id @default(cuid())
  name      String
  image     String
  group     LogoGroup
  sortOrder Int       @default(0)
  published Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([group])
}
```

- [ ] **Step 2: Datos de fallback (extraídos de los arrays actuales)**

Crear `lib/content/logos.data.ts`:
```ts
export type LogoItem = { name: string; image: string };

export const BRAND_LOGOS: LogoItem[] = [
  { name: "Interlace", image: "/brands/interlace.png" },
  { name: "Comint", image: "/brands/comint.png" },
  { name: "Tierra Forestal", image: "/brands/tienda-forestal.png" },
  { name: "Evolution Week", image: "/brands/evolution-week.png" },
  { name: "TAME", image: "/brands/tame.png" },
  { name: "Toma", image: "/brands/toma.png" },
  { name: "Casa Klik", image: "/brands/casas-krea.png" },
];

export const TECH_LOGOS: LogoItem[] = [
  { name: "Next.js", image: "/tech/nextjs.svg" },
  { name: "React", image: "/tech/react.svg" },
  { name: "WordPress", image: "/tech/wordpress.svg" },
  { name: "TypeScript", image: "/tech/typescript.svg" },
  { name: "Supabase", image: "/tech/supabase.svg" },
  { name: "AWS", image: "/tech/aws.svg" },
  { name: "Stripe", image: "/tech/stripe.svg" },
  { name: "React Native", image: "/tech/reactnative.svg" },
];
```

- [ ] **Step 3: Loader con fallback**

Crear `lib/content/logos.ts`:
```ts
import { db } from "@/lib/db";
import { safeQuery } from "./safe";
import { BRAND_LOGOS, TECH_LOGOS, type LogoItem } from "./logos.data";

export type { LogoItem };

export async function getLogosAsync(group: "BRAND" | "TECH"): Promise<LogoItem[]> {
  const fallback = group === "BRAND" ? BRAND_LOGOS : TECH_LOGOS;
  return safeQuery(async () => {
    const rows = await db.logo.findMany({
      where: { group, published: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.length ? rows.map((r) => ({ name: r.name, image: r.image })) : fallback;
  }, fallback);
}
```

- [ ] **Step 4: Migración + generate**

```bash
docker compose exec -T web npx prisma migrate dev --name logos
npx prisma generate
```
Expected: "in sync" + "Generated Prisma Client".

- [ ] **Step 5: Lint + typecheck**

```bash
npm run lint && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(logos): modelo Logo + loader con fallback (marcas/tecnologías)"
```

---

### Task 7: Admin `/admin/logos`

**Files:**
- Create: `app/(admin)/admin/(protected)/logos/page.tsx`
- Create: `app/(admin)/admin/(protected)/logos/_list.tsx`
- Create: `app/(admin)/admin/_actions/logos.ts`
- Modify: `app/(admin)/admin/(protected)/_nav.tsx`

**Interfaces:**
- Consumes: modelo `Logo` (Task 6).
- Produces: acciones `saveLogo(form)`, `deleteLogo(id)`.

- [ ] **Step 1: Server actions**

Crear `app/(admin)/admin/_actions/logos.ts`:
```ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  image: z.string().min(1).max(500),
  group: z.enum(["BRAND", "TECH"]),
  sortOrder: z.number().int(),
  published: z.boolean(),
});

export async function saveLogo(input: {
  id?: string;
  name: string;
  image: string;
  group: "BRAND" | "TECH";
  sortOrder: number;
  published: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };
  const { id, ...data } = parsed.data;
  try {
    if (id) await db.logo.update({ where: { id }, data });
    else await db.logo.create({ data });
  } catch {
    return { ok: false, error: "No se pudo guardar." };
  }
  return { ok: true };
}

export async function deleteLogo(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await db.logo.delete({ where: { id } });
  return { ok: true };
}
```

- [ ] **Step 2: Lista cliente (alta/edición/borrado por grupo)**

Crear `app/(admin)/admin/(protected)/logos/_list.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveLogo, deleteLogo } from "../../_actions/logos";

type Row = { id: string; name: string; image: string; group: "BRAND" | "TECH"; sortOrder: number; published: boolean };
type MediaItem = { id: string; url: string; filename: string };

const GROUPS: { key: "BRAND" | "TECH"; label: string }[] = [
  { key: "BRAND", label: "Marcas (clientes)" },
  { key: "TECH", label: "Tecnologías" },
];

function Editor({ row, group, media, onDone }: { row?: Row; group: "BRAND" | "TECH"; media: MediaItem[]; onDone: () => void }) {
  const [name, setName] = useState(row?.name ?? "");
  const [image, setImage] = useState(row?.image ?? "");
  const [sortOrder, setSortOrder] = useState(row?.sortOrder ?? 0);
  const [published, setPublished] = useState(row?.published ?? true);
  const [busy, setBusy] = useState(false);

  return (
    <div className="adm-logo-edit">
      <input className="adm-input" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="adm-input" placeholder="/ruta o URL" value={image} onChange={(e) => setImage(e.target.value)} />
      {media.length > 0 && (
        <select className="adm-input" value="" onChange={(e) => e.target.value && setImage(e.target.value)}>
          <option value="">— biblioteca —</option>
          {media.map((m) => <option key={m.id} value={m.url}>{m.filename}</option>)}
        </select>
      )}
      <input className="adm-input adm-logo-edit__order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
      <label className="adm-check"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Público</label>
      {image && /* eslint-disable-next-line @next/next/no-img-element */ <img className="adm-slot__img" src={image} alt="" />}
      <button type="button" className="adm-btn" disabled={busy || !name || !image} onClick={async () => {
        setBusy(true);
        await saveLogo({ id: row?.id, name, image, group, sortOrder, published });
        setBusy(false);
        onDone();
      }}>{busy ? "Guardando…" : row ? "Guardar" : "Añadir"}</button>
    </div>
  );
}

export default function LogosList({ brand, tech, media }: { brand: Row[]; tech: Row[]; media: MediaItem[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const byGroup = { BRAND: brand, TECH: tech };

  return (
    <div className="adm-logos">
      {GROUPS.map((g) => (
        <section className="adm-panel" key={g.key}>
          <p className="adm-section-title">{g.label}</p>
          {byGroup[g.key].map((row) => (
            <div className="adm-logo-row" key={row.id}>
              <Editor row={row} group={g.key} media={media} onDone={refresh} />
              <button type="button" className="adm-danger__btn" onClick={() => deleteLogo(row.id).then(refresh)}>Eliminar</button>
            </div>
          ))}
          <div className="adm-logo-row adm-logo-row--new">
            <Editor group={g.key} media={media} onDone={refresh} />
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Página server**

Crear `app/(admin)/admin/(protected)/logos/page.tsx`:
```tsx
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/content/safe";
import LogosList from "./_list";

export const dynamic = "force-dynamic";

export default async function LogosPage() {
  const [logos, media] = await Promise.all([
    safeQuery(() => db.logo.findMany({ orderBy: { sortOrder: "asc" } }), []),
    safeQuery(() => db.media.findMany({ orderBy: { createdAt: "desc" } }), []),
  ]);
  const brand = logos.filter((l) => l.group === "BRAND");
  const tech = logos.filter((l) => l.group === "TECH");

  return (
    <>
      <header className="adm__head">
        <h1 className="adm__title">Logos</h1>
        <p className="adm__subtitle">Marcas de clientes y tecnologías que se muestran en el home.</p>
      </header>
      <LogosList brand={brand} tech={tech} media={media} />
    </>
  );
}
```

- [ ] **Step 4: Link en el nav**

En `app/(admin)/admin/(protected)/_nav.tsx`, añadir a `ICONS`:
```ts
  logos: "M4 7h16M4 12h16M4 17h10M19 15l2 2-2 2",
```
Y a `NAV`, después de la entrada de Portafolio:
```ts
  { href: "/admin/logos", label: "Logos", icon: ICONS.logos, ready: true },
```

- [ ] **Step 5: Estilos mínimos**

En `app/admin-x.css`, al final:
```css
.adm-logos { display: flex; flex-direction: column; gap: 1.25rem; }
.adm-logo-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.07); }
.adm-logo-row--new { border-bottom: 0; opacity: 0.9; }
.adm-logo-edit { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; flex: 1; }
.adm-logo-edit__order { max-width: 72px; }
.adm-logo-edit .adm-slot__img { height: 34px; width: auto; }
```

- [ ] **Step 6: Lint + typecheck + build**

```bash
npm run lint && npx tsc --noEmit && npm run build
```
Expected: la ruta `/admin/logos` aparece en la salida del build.

- [ ] **Step 7: Verificación visual**

Ruta nueva → limpiar cache:
```bash
docker compose exec web sh -c "rm -rf .next/*" && docker compose restart web
```
En chrome-devtools: `/admin/logos` muestra dos secciones (Marcas, Tecnologías); añadir un logo de prueba en Marcas (nombre + imagen de la biblioteca), confirmar que aparece; eliminarlo.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(admin/logos): bandeja de logos (marcas + tecnologías)"
```

---

### Task 8: Cablear Services + Technologies + sembrar logos

**Files:**
- Modify: `app/(site)/[locale]/page.tsx`
- Modify: `components/sections/Services.tsx`
- Modify: `components/sections/Technologies.tsx`

**Interfaces:**
- Consumes: `getLogosAsync` (Task 6).
- Produces: `Services` recibe `logos: LogoItem[]`; `Technologies` recibe `techLogos: LogoItem[]`.

- [ ] **Step 1: Cargar logos en el home y pasarlos**

En `app/(site)/[locale]/page.tsx`, importar:
```ts
import { getLogosAsync } from "@/lib/content/logos";
```
Añadir al `Promise.all` (junto a `projects`):
```ts
    getLogosAsync("BRAND"),
    getLogosAsync("TECH"),
```
y recoger las variables: `const [dict, pricing, slotMap, projects, brandLogos, techLogos] = await Promise.all([...]);`
Pasar a los componentes:
```tsx
      <Services dict={dict} locale={l} slotMap={slotMap} logos={brandLogos} />
      ...
      <Technologies dict={dict} techLogos={techLogos} />
```

- [ ] **Step 2: Usar `logos` en Services**

En `components/sections/Services.tsx`, importar el tipo:
```ts
import type { LogoItem } from "@/lib/content/logos.data";
```
Añadir `logos` a las props:
```ts
export default function Services({ dict, locale, slotMap, logos }: { dict: Dictionary; locale: Locale; slotMap?: SlotMap; logos: LogoItem[] }) {
```
Eliminar el array `LOGOS` (líneas 21–29). Donde se mapeaban los logos (cerca de la línea 249, `LOGOS.map((b) => ...)` con `brandSlot(b.file)`), reemplazar por:
```tsx
                {logos.map((b) => (
                  <span className="..." key={b.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.image} alt={b.name} loading="lazy" draggable={false} />
                  </span>
                ))}
```
(conservar las mismas clases CSS que tenía el `<span>`/`<img>` original del strip).

- [ ] **Step 3: Usar `techLogos` en Technologies**

En `components/sections/Technologies.tsx`, importar el tipo y quitar el array `TECH`:
```ts
import type { LogoItem } from "@/lib/content/logos.data";
```
Firma:
```ts
export default function Technologies({ dict, techLogos }: { dict: Dictionary; techLogos: LogoItem[] }) {
```
Cambiar `TECH.map((item, i) => ...)` por `techLogos.map((item, i) => ...)` y el contenido de la tarjeta a usar `item.image`/`item.name` (ya no hay `file`/`text`/`slotMap`):
```tsx
            <span className="tech-card__logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name} loading="lazy" draggable={false} />
            </span>
            <span className="tech-card__name">{item.name}</span>
```
Quitar el import de `resolveSlot, techSlot, type SlotMap` (ya no se usan).

- [ ] **Step 4: Sembrar los logos actuales en DB**

```bash
docker compose exec -T web node -e '
const {PrismaClient}=require("@prisma/client"); const db=new PrismaClient();
const B=[["Interlace","/brands/interlace.png"],["Comint","/brands/comint.png"],["Tierra Forestal","/brands/tienda-forestal.png"],["Evolution Week","/brands/evolution-week.png"],["TAME","/brands/tame.png"],["Toma","/brands/toma.png"],["Casa Klik","/brands/casas-krea.png"]];
const T=[["Next.js","/tech/nextjs.svg"],["React","/tech/react.svg"],["WordPress","/tech/wordpress.svg"],["TypeScript","/tech/typescript.svg"],["Supabase","/tech/supabase.svg"],["AWS","/tech/aws.svg"],["Stripe","/tech/stripe.svg"],["React Native","/tech/reactnative.svg"]];
(async()=>{ const n=await db.logo.count(); if(n>0){console.log("ya hay logos, no siembro");await db.$disconnect();return;} let i=0; for(const [name,image] of B){await db.logo.create({data:{name,image,group:"BRAND",sortOrder:i++}});} i=0; for(const [name,image] of T){await db.logo.create({data:{name,image,group:"TECH",sortOrder:i++}});} console.log("sembrados",B.length+T.length); await db.$disconnect(); })();
'
```
Expected: "sembrados 15".

- [ ] **Step 5: Lint + typecheck + build**

```bash
npm run lint && npx tsc --noEmit && npm run build
```
Expected: build OK.

- [ ] **Step 6: Verificación visual**

`docker compose restart web`. En chrome-devtools `/es`: el strip de logos de clientes (sección Servicios) y la grilla de Tecnologías se ven igual que antes. En `/admin/logos`, ocultar un logo (Público off) y confirmar que desaparece del home tras recargar.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): strip de marcas y tecnologías desde el CMS"
```

---

## M3 — Pulido visual + responsive

### Task 9: Hub `/portafolio` alineado al UI estándar

**Files:**
- Modify: `app/(site)/[locale]/portafolio/page.tsx`
- Modify: `app/sections.css` (o el archivo CSS donde viven las clases `pf-card`/`hub`)

**Interfaces:**
- (solo presentación; sin cambios de datos ni de firma)

- [ ] **Step 1: Identificar el CSS del hub**

```bash
grep -rn "pf-card__\|hub__" app/*.css
```
Expected: localiza las reglas a ajustar (radios, sombras, tipografía del nombre/descr, grilla responsive).

- [ ] **Step 2: Alinear las tarjetas al lenguaje `svc-rcase`**

Ajustar las reglas `.pf-card*` para igualar radios/sombras/espaciados de las tarjetas de servicio (`.svc-rcase*`): imagen arriba, categoría como eyebrow, nombre (display, peso 700), descripción (muted), padding consistente. Mantener la grilla responsive (`repeat(auto-fill, minmax(280px, 1fr))` o equivalente ya usado).

- [ ] **Step 3: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 4: Verificación visual a dos anchos**

`docker compose restart web`. En chrome-devtools, `/es/portafolio`:
- `resize_page` a 1440×900: tarjetas consistentes, sin desbordes.
- `resize_page` a 390×844: una columna, legible, imágenes proporcionadas.
Tomar captura a cada ancho.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "style(portafolio): hub alineado al UI estándar de tarjetas"
```

---

### Task 10: Consistencia + responsive + a11y (home y secciones data-driven)

**Files:**
- Modify: `app/sections.css` (y/o `app/globals.css` según dónde estén las reglas)
- Modify: `components/sections/Portfolio.tsx` (solo `alt` si aplica)

**Interfaces:**
- (solo presentación/a11y)

- [ ] **Step 1: Auditar overflow/responsive en chrome-devtools**

`/es` a 390×844: revisar bento (ahora variable), strip de marcas y grilla de tecnologías. Anotar cualquier desborde, solapamiento o texto cortado.

- [ ] **Step 2: Ajustar CSS de las secciones afectadas**

Corregir lo anotado: `min-width: 0` en items de grid que desbordan, `gap`/`padding` móviles, `object-fit: contain` en logos, truncado del nombre de la bento si es muy largo (`-webkit-line-clamp: 2`). Solo CSS.

- [ ] **Step 3: `alt` significativos**

En la bento (`Portfolio.tsx`), la imagen de fondo es decorativa (`alt=""` aria-hidden) — dejar así. Verificar que los logos (Services/Technologies) usan `alt={name}` (hecho en M2). Sin cambios si ya cumplen.

- [ ] **Step 4: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Verificación visual final**

`docker compose restart web`. Capturas de `/es` a 1440 y 390 px: sin desbordes, consola sin errores (`list_console_messages`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "style(home): consistencia, responsive y a11y de secciones data-driven"
```

---

## Notas de cierre

- Tras M1–M3: editar un proyecto o un logo en `/admin` se refleja en home (bento, strip de marcas, tecnologías), megamenú, hub y relacionados — el CMS es la fuente de verdad.
- Actualizar la memoria `alrit-admin-lms-payments` con "Sweep CMS + calidad HECHO" y los commits.
- Fuera de alcance (no tocar en este plan): editor de slots manual del bento, `SocialProof`/`Testimonials` (sin uso), notificaciones por email, Stripe, deploy, contenido real del cliente.
