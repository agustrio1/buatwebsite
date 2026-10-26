# syntax=docker/dockerfile:1

# ---------- 1. Dependencies (dipakai untuk build, termasuk dev deps) ----------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- 2. Build ----------
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# next build menghasilkan .next/standalone (output: "standalone" di next.config.ts)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- 3. Runner (hanya berisi yang dibutuhkan server.js standalone) ----------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Standalone sudah membawa server.js + node_modules minimal (prod deps ter-treeshake)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
