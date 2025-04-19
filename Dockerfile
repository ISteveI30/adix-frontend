# Etapa 1: Construcción de la aplicación
FROM node:alpine3.21 AS builder

# Instala dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Configura variables de entorno para la construcción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instala pnpm de manera eficiente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia solo los archivos necesarios para instalar dependencias (mejor caché de Docker)
COPY package.json pnpm-lock.yaml* ./

# Instala dependencias con pnpm
RUN pnpm install --frozen-lockfile --prod=false

# Copia el resto de los archivos
COPY . .

# Construye la aplicación
RUN pnpm build

# Etapa 2: Imagen de producción optimizada
FROM node:alpine3.21 AS runner

WORKDIR /app

# Configura variables de entorno para producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Instala pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia solo los artefactos necesarios desde la etapa de construcción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Configura usuario no root para mayor seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 3000

# Health check para monitoreo
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]