# =============================================================
# Wumpus Frontend (Angular) — Dockerfile multi-stage
# =============================================================

# Etapa 1: Compilar Angular
FROM node:22-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar para producción
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar los archivos compilados
COPY --from=build /app/dist/wumpus-frontend/browser /usr/share/nginx/html

# Configurar nginx para SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://api-gateway:5000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
