# ==============================================================================
# UPGRADE ERP/CRM - Production Multi-Stage Dockerfile (Next.js 16 Standalone)
# Optimizado para Coolify / Hetzner Cloud (x86_64 / arm64)
# ==============================================================================

# 1. Base Image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 2. Dependencies Stage
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno seguras para el paso de compilación estática de Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://postgres:postgrespassword@127.0.0.1:5432/upgrade_db"
ENV ENCRYPTION_KEY="UPGRADE_Build_Time_Secret_Key_Placeholder_2026!"

RUN npm run build

# 4. Runner Stage (Producción ultraliviana)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crear usuario y grupo de sistema sin privilegios de root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Crear y asignar permisos a los directorios de trabajo y almacenamiento persistente
RUN mkdir -p /app/.next /app/uploads/vault \
    && chown -R nextjs:nodejs /app/.next /app/uploads

# Copiar assets públicos y compilados desde la etapa builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no-root
USER nextjs

EXPOSE 3000

# Verificación de salud del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/login > /dev/null || exit 1

CMD ["node", "server.js"]
