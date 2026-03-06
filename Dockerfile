# Build stage
FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install 2>/dev/null || pnpm install 2>/dev/null || yarn install 2>/dev/null || true

COPY . .
RUN npm run build 2>/dev/null || pnpm build 2>/dev/null || yarn build 2>/dev/null || npx vite build

# Serve stage
FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY scripts/start.sh /app/scripts/start.sh
RUN chmod +x /app/scripts/start.sh

EXPOSE 3000
ENV PORT=3000
CMD ["/app/scripts/start.sh"]
