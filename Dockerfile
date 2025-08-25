# Multi-stage build: Expo export (web) -> Nginx static server

# 1) Builder: Node + Expo export
FROM node:20-bullseye AS builder
WORKDIR /app

# Install deps first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy sources and build web
COPY . .
# Export static web site to ./dist
RUN npx expo export -p web
# Ensure SPA fallback exists for static hosts if needed
RUN cp -f dist/index.html dist/404.html || true

# 2) Runtime: Nginx to serve the static site
FROM nginx:1.27-alpine

# Copy our Nginx config (serves app under /nicolas-willaume-food-truck/)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built site
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

