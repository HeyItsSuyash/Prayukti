# ────────────────────────────────────────────────────────────────
# Stage 1: Builder
# ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (separate layer for Docker cache)
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source and build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Prune devDependencies for production
RUN npm prune --production

# ────────────────────────────────────────────────────────────────
# Stage 2: Production Image
# ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS production

# Security: add non-root user
RUN addgroup -S prayukti && adduser -S prayukti -G prayukti

WORKDIR /app

# Copy only what we need from builder
COPY --from=builder --chown=prayukti:prayukti /app/dist ./dist
COPY --from=builder --chown=prayukti:prayukti /app/node_modules ./node_modules
COPY --from=builder --chown=prayukti:prayukti /app/package.json ./package.json

# Use non-root user
USER prayukti

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/v1/health || exit 1

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/main"]
