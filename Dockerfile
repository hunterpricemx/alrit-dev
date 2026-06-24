# Alrit.dev — imagen multi-target (dev + producción standalone).
# Debian slim (glibc) evita el dolor de Prisma + musl en Alpine.

# ---------- base ----------
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV NEXT_TELEMETRY_DISABLED=1

# ---------- deps (instala node_modules + cliente Prisma) ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

# ---------- dev (hot-reload; el código llega por bind-mount) ----------
FROM deps AS dev
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]

# ---------- builder (build de producción, output standalone) ----------
FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- runner (producción) ----------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN useradd -m nextjs
# standalone NO copia public ni .next/static: hay que copiarlos a mano.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Motor + cliente de Prisma para runtime.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
