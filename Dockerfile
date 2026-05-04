FROM node:22-alpine AS base

# Instal·lar dependències només quan sigui necessari
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instal·lar dependències
COPY package.json package-lock.json* ./
# Optimització per a màquines amb poca RAM
RUN npm ci --prefer-offline --no-audit

# Reconstruir el codi font
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma client
RUN npx prisma generate

# Desactivar telemetria i augmentar memòria per al build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_OPTIONS="--max-old-space-size=1536"

RUN npm run build

# Imatge de producció
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
