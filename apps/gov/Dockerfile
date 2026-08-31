FROM node:24.20.0-alpine@sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf AS base
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN test -n "$PNPM_VERSION" && corepack enable pnpm && corepack install -g pnpm@"$PNPM_VERSION"

FROM base AS builder
ARG TURBO_VERSION
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN test -n "$TURBO_VERSION" && pnpm add -g turbo@"$TURBO_VERSION"
COPY . .
RUN turbo prune @babyn-yar/gov --docker

# Install ALL dependencies and build
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY --from=builder /app/out/json/ .

# Install all dependencies (including dev)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY --from=builder /app/out/full/ .

# Build arguments
ARG API_URL
ENV VITE_API_URL=${API_URL}

# Build the project
RUN pnpm exec turbo build --filter=@babyn-yar/gov...
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --legacy --filter=@babyn-yar/gov --prod /prod/gov

# Final runtime stage
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astrojs
USER astrojs

COPY --from=installer --chown=astrojs:nodejs /prod/gov /app

# Runtime environment variables
ARG API_URL
ENV VITE_API_URL=${API_URL}
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

EXPOSE 4321

CMD [ "node", "./dist/server/entry.mjs" ]
