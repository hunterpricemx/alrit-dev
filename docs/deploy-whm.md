# Despliegue de Alrit.dev — WHM/cPanel + Docker + Cloudflare

El sitio corre como stack Docker (Next.js standalone + Postgres + MinIO) detrás del
Apache de cPanel como **reverse proxy**, con **Cloudflare** al frente (tus DNS ya
están "Proxied": `alrit.dev` A → tu IP, `www` CNAME → `alrit.dev`).

Cadena de la petición: **Cloudflare (443) → Apache de cPanel (443) → ProxyPass → 127.0.0.1:3000 (Docker)**.

---

## 0. Requisitos en el servidor
- Root/SSH (VPS o dedicado con WHM — no shared).
- Docker + Docker Compose v2.
- ≥ 2 GB RAM para el build (si es justo, crea swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`).
- Firewall (CSF): abre solo **80/443** al público. NO expongas 3000/5432/9000/9001.

## 1. Subir el código y configurar el entorno
```bash
ssh root@77.37.74.50
git clone <tu-repo> alrit && cd alrit
cp .env.production.example .env
nano .env   # rellena TODO con valores reales y fuertes
```
Genera lo importante:
```bash
openssl rand -base64 32                                             # → AUTH_SECRET
node -e "console.log(require('bcryptjs').hashSync('TU_PASSWORD',10))" # → ADMIN_PASSWORD_HASH
```
Confirma en `.env`: `AUTH_URL=https://alrit.dev`, `AUTH_TRUST_HOST=true`,
`S3_PUBLIC_URL=https://media.alrit.dev/alrit-media`.

## 2. Levantar el stack
```bash
docker compose -f docker-compose.prod.yml up -d --build
# primera vez: crea el usuario admin
docker compose -f docker-compose.prod.yml run --rm migrate npm run db:seed
```
Prueba local en el servidor: `curl -I http://127.0.0.1:3000` → 200.

## 3. Reverse proxy en WHM (que sobreviva a las actualizaciones de cPanel)
Crea el dominio `alrit.dev` como cuenta/addon en cPanel. Luego, en
**WHM → Apache Configuration → Include Editor → Pre Main Include** (o un
*userdata* include del vhost), añade el proxy hacia Docker:

```apache
<VirtualHost *:443>
    ServerName alrit.dev
    ServerAlias www.alrit.dev
    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    ProxyPass        / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```
Y el subdominio de medios (MinIO) — crea `media.alrit.dev` (Cloudflare: CNAME → alrit.dev, Proxied) y:
```apache
<VirtualHost *:443>
    ServerName media.alrit.dev
    ProxyPreserveHost On
    ProxyPass        / http://127.0.0.1:9000/
    ProxyPassReverse / http://127.0.0.1:9000/
</VirtualHost>
```
Recarga Apache: `WHM → Restart Apache` (o `/scripts/restartsrv_httpd`).
> Nota: usa el **Include Editor** (no edites el vhost directo) para que cPanel no lo borre al regenerar configs. Necesitas el módulo `mod_proxy`/`mod_proxy_http` activos (EasyApache 4).

## 4. Cloudflare (¡el paso que evita el bucle de redirección!)
En el panel de Cloudflare del dominio:
- **SSL/TLS → Overview → modo `Full (strict)`**. (NUNCA `Flexible`: causa bucle de
  redirección infinito y es inseguro.)
- **Origin**: instala un **Certificado de Origen de Cloudflare** en el servidor
  (WHM → Install an SSL Certificate) **o** deja que el AutoSSL de cPanel emita el de
  Let's Encrypt para alrit.dev/www/media. Con cualquiera, `Full (strict)` valida.
- **Always Use HTTPS: On**. `.dev` exige HTTPS (está en la HSTS preload list) — con
  Cloudflare al frente queda cubierto.
- **IP real del visitante**: instala `mod_cloudflare`/`mod_remoteip` en EasyApache
  para que los logs vean la IP real (no la de Cloudflare). Opcional para este sitio.
- **Caché**: deja las páginas dinámicas SIN cachear en Cloudflare (o crea una Cache
  Rule que **bypasee** `/admin/*` y las respuestas con cookies). Los assets de
  `/hero /portfolio /brands /tech` ya mandan `Cache-Control: immutable` (se cachean solos).
- `www` → apex: crea una Redirect Rule 301 `www.alrit.dev/*` → `https://alrit.dev/$1`
  (o al revés, elige uno como canónico).

## 5. Post-deploy
- Entra a **https://alrit.dev/admin** (`ADMIN_EMAIL` / tu password) y en
  **Configuración** captura WhatsApp, redes, GA4 ID y dirección.
- **Google Search Console**: verifica la propiedad de dominio y envía `https://alrit.dev/sitemap.xml`.
- Comprueba: `https://alrit.dev/robots.txt`, `/sitemap.xml`, una página de servicio (JSON-LD),
  y que las imágenes de medios subidas desde el admin cargan por `media.alrit.dev`.

## Actualizaciones futuras
```bash
cd alrit && git pull
docker compose -f docker-compose.prod.yml up -d --build   # corre migraciones solo y reinicia
```

## Gotchas
- **Cloudflare `Flexible`** = bucle de redirección. Usa **Full (strict)**.
- **`.dev` sin HTTPS no carga** — el SSL no es opcional.
- **`web`/`minio` en 127.0.0.1** — nunca los expongas a 0.0.0.0.
- **Migraciones**: el servicio `migrate` corre `prisma migrate deploy` solo en cada `up`.
  El `db:seed` (crea el admin) es **manual y de una sola vez**.
- **CSF**: si bloquea Docker, permite la red `br-*`/`docker0` en su config.
