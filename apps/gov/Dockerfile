FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable pnpm && corepack install -g pnpm@11.10.0

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN pnpm add -g turbo@2.10.3
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
