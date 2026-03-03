# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL is injected at build time.
# Leave empty ("") so all API calls use relative paths when served behind nginx.
# Override for standalone deployments: --build-arg VITE_API_URL=https://your-gateway.railway.app
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# SPA routing: fallback all paths to index.html
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
