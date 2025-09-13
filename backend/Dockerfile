# Backend Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# Install both production and dev dependencies for the build stage
RUN npm ci && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (needs to be before build)
RUN npx prisma generate

# Build the application
RUN npm run build

# Verify the build output exists
RUN ls -la dist/

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install only production dependencies in the final stage
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy the built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client in production stage (needed for runtime)
RUN npx prisma generate

# Change ownership of the app directory to nestjs user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/src/main.js"]