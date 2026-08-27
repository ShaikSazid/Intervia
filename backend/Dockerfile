# ============================================================
# Stage 1 — Build
# ============================================================

FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Prisma requires OpenSSL to select the correct engine
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma files
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source
COPY src ./src

# Build application
RUN npm run build


# ============================================================
# Stage 2 — Production
# ============================================================

FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

# Prisma requires OpenSSL at runtime too
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy Prisma files
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma Client using the correct OpenSSL environment
RUN npx prisma generate

# Copy compiled application
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.js"]