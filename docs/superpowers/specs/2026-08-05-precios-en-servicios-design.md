# Precios "Desde $X" en la página de servicios

**Fecha:** 2026-08-05
**Estado:** aprobado, pendiente de implementar

## Problema

`/[locale]/servicios` lista los 9 servicios sin ninguna señal de precio. Un
visitante que llega desde Google no sabe si el servicio cuesta $7,000 o $60,000
hasta que entra a la ficha o abre la calculadora.

Al mismo tiempo hay dos defectos en cómo el sitio muestra precios hoy:

1. **La home ignora `/admin/pricing`.** `components/sections/Services.tsx`
   importa las constantes `PROJECT_TYPES` y `PROMO_PRICES` directamente de
   `lib/pricing.ts`, mientras la calculadora usa `getPricingAsync()`, que sí lee
   los overrides de la base. Un admin que cambia un precio actualiza la
   calculadora pero no las tarjetas de "Lo que construimos".
2. **El mapeo servicio → tipo de precio vive dentro de un componente.**
   `CARD_TYPE` está declarado en `Services.tsx`. Si la página de servicios
   declara el suyo, las dos listas se desincronizan en cuanto alguien toque una.

## Alcance

**Dentro:** mostrar precio en las 9 tarjetas de `/servicios`, unificar el mapeo
y la lógica de precio en un solo lugar, y arreglar de paso que la home lea los
overrides de la base.

**Fuera** (decisiones aparte, no se tocan aquí):

- FAQ, `ItemList` en JSON-LD y CTA final en `/servicios`.
- El bug de `Reveal` (contenido en `opacity: 0` hasta que hidrata React). Afecta
  a todo el sitio, no solo a esta página.

## Decisiones tomadas

| Pregunta | Decisión |
| --- | --- |
| ¿Los precios de `lib/pricing.ts` son reales? | Sí. Se retira la advertencia de `PLACEHOLDER` del encabezado del archivo. |
| ¿Qué pasa con los 3 servicios sin precio? | Muestran "Cotización a medida" con enlace a la calculadora. |
| ¿WordPress y Desarrollo web? | Ambos mapean a `landing`. El tipo ya se etiqueta "Landing / Página web" en `LEAD_TYPE_LABELS` (`_actions/quote.ts`), así que el modelo ya los contempla juntos. |
| ¿Se muestra la promo? | Sí, igual que la home: precio promocional con el regular tachado. Al pasar `PROMO_ENDS_AT` (2026-08-31) caen solos al regular, sin intervención. |

## Diseño

### Fuente única: `lib/pricing.ts`

Se le añaden dos exports. El archivo ya es el dueño del modelo de precios, así
que es su lugar natural — no hace falta un módulo nuevo.

```ts
/** Qué tipo de la calculadora le corresponde a cada servicio. */
export const SERVICE_PRICE_TYPE: Partial<Record<ServiceId, ProjectTypeId>> = {
  wordpress: "landing",
  webdev: "landing",
  ecommerce: "ecommerce",
  lms: "lms",
  realestate: "realestate",
  mobile: "mobile",
  // systems, automation y chatbots quedan fuera a propósito: son a cotizar.
};

/**
 * Precio a mostrar para un servicio. `null` => cotización a medida.
 * Recibe `pricing` por argumento para respetar los overrides de /admin/pricing.
 */
export function servicePrice(
  id: ServiceId,
  pricing: Pricing,
  now?: Date,
): { current: number; was: number | null } | null;
```

`servicePrice` resuelve el tipo con `SERVICE_PRICE_TYPE`, lo busca en
`pricing.types` y delega en la `displayPrice` que ya existe, que es quien decide
si la promo aplica. No duplica la lógica de promoción.

**Dependencia nueva:** `lib/pricing.ts` pasa a importar el tipo `ServiceId` de
`lib/services.ts`. `services.ts` no importa de `pricing.ts`, así que no se crea
un ciclo.

### Consumidores

```
                    lib/pricing.ts
                 SERVICE_PRICE_TYPE
                   servicePrice()
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
     Services.tsx                servicios/page.tsx
     (home)                      (hub)
     recibe `pricing` por prop   llama a getPricingAsync()
```

**`app/(site)/[locale]/servicios/page.tsx`**
Añade `const pricing = await getPricingAsync()` y, dentro del `.map`, renderiza
debajo de `hub-card__text`:

- Con precio: `{dict.services.priceFrom} {formatMXN(current)}` y, si `was` no es
  `null`, el regular en `<s>`.
- Sin precio: `{dict.servicesHub.customPrice}` — texto, no enlace, porque la
  tarjeta entera ya es un `<Link>` a la ficha del servicio y anidar un ancla
  dentro de otra es HTML inválido. El acceso a la calculadora se mantiene por la
  ficha del servicio, que ya tiene su CTA.

**`components/sections/Services.tsx`**
Se le borra `CARD_TYPE` y el bloque IIFE que calcula el precio. Pasa a recibir
`pricing: Pricing` como prop y usa `servicePrice(id, pricing)`. Esto corrige el
defecto de que la home ignoraba los overrides de la base.

**`app/(site)/[locale]/page.tsx`**
Ya llama a `getPricingAsync()` para la calculadora; solo hay que pasar ese mismo
`pricing` también a `<Services>`. No añade una consulta extra.

### Diccionarios

Clave nueva bajo `servicesHub`, en `es.ts` y `en.ts`:

| Clave | es | en |
| --- | --- | --- |
| `servicesHub.customPrice` | `"Cotización a medida"` | `"Custom quote"` |

`servicesX.priceFrom` ("Desde" / "From") ya existe y se reutiliza en vez de
duplicar la etiqueta. El acoplamiento entre namespaces lo cubre TypeScript: si
`servicesX` se renombra, el build falla en el hub.

### Estilos

Una regla nueva en `app/pages.css` para `.hub-card__price`, con el mismo
tratamiento visual que la home: peso semibold, tono `--color-ink`, y el precio
tachado en `--color-muted` a peso normal. El texto de "Cotización a medida" usa
la misma clase con un modificador `--custom` en tono apagado.

## Renderizado y caché

`/servicios` ya es SSG con `export const revalidate = 3600`. Añadir
`getPricingAsync()` no la vuelve dinámica: la consulta corre en build y en cada
revalidación, igual que en la home. `safeQuery` garantiza que si la base no
responde durante el build, cae a `DEFAULT_PRICING` y la página no se rompe.

Un cambio de precio desde `/admin/pricing` se refleja al revalidar. La acción
`savePricing` ya hace `revalidatePath` de cada locale, pero **solo de la home**
(`/${l}`). Hay que extenderla para que revalide también `/${l}/servicios`, o el
hub se quedaría con el precio viejo hasta una hora.

## Criterios de aceptación

1. `/es/servicios` y `/en/servicios` muestran precio en las 6 tarjetas mapeadas
   y "Cotización a medida" en Sistemas, Automatizaciones y Chatbots.
2. Con la promo vigente, esas 6 muestran el promocional y el regular tachado.
3. Con `isPromoActive()` en `false`, muestran solo el regular, sin tachado.
4. Cambiar un precio en `/admin/pricing` se refleja en la home **y** en
   `/servicios` tras revalidar.
5. `SERVICE_PRICE_TYPE` es la única lista servicio → tipo en el repo:
   `grep -rn "CARD_TYPE"` no devuelve nada.
6. `npx tsc --noEmit`, `npx eslint .` y `npx next build` pasan limpios.

## Verificación

Además de las comprobaciones automáticas, capturas de `/es/servicios` y de la
home antes y después, para confirmar que el tratamiento del precio es idéntico
en ambas y que las tarjetas no se descuadran con la línea nueva.
