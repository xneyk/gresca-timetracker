FROM node:20-alpine AS base

# Instal·lar dependències només quan sigui necessari
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instal·lar dependències basades en package-lock.json
COPY package.json package-lock.json* ./
RUN npm ci

# Reconstruir el codi font només quan sigui necessari
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma client
RUN npx prisma generate

# Desactivar telemetria de Next.js durant el build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Imatge de producció, copiar tots els fitxers i executar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copiar el fitxer standalone i els assets estàtics
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# El comando per defecte és arrencar el servidor
CMD ["node", "server.js"]
