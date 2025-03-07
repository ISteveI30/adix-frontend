# Etapa 1: Construcción de la aplicación
FROM node:18-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia los archivos de configuración del proyecto
COPY package.json pnpm-lock.yaml* ./

# Instala las dependencias del proyecto
RUN pnpm fetch && pnpm install --offline

# Copia el resto de los archivos del proyecto
COPY . .

# Construye la aplicación
RUN pnpm build

# Etapa 2: Imagen final ligera
FROM node:18-alpine AS runner

# Establece el directorio de trabajo
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia solo los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Elimina las dependencias de desarrollo
RUN pnpm prune --prod

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["pnpm", "start"]