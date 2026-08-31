FROM node:24.20.0-alpine@sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf AS base
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN test -n "$PNPM_VERSION" && corepack enable pnpm && corepack install -g pnpm@"$PNPM_VERSION"

FROM base AS builder
ARG TURBO_VERSION
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN test -n "$TURBO_VERSION" && pnpm add -g turbo@"$TURBO_VERSION"
COPY . .
RUN turbo prune @babyn-yar/admin --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ARG PUBLIC_API_URL
ENV VITE_API_URL=${PUBLIC_API_URL}

COPY --from=builder /app/out/full/ .

RUN --mount=type=secret,id=sentry-org,env=SENTRY_ORG  \
  --mount=type=secret,id=sentry-project,env=SENTRY_PROJECT  \
  --mount=type=secret,id=sentry-auth-token,env=SENTRY_AUTH_TOKEN \
  pnpm exec turbo run build --filter=@babyn-yar/admin...

FROM nginx:1.31.4-alpine@sha256:db35bfc6b2951e7f8a72db5db120288c127ffaeeb4a6d4b95a26fead017d5913 AS runtime

WORKDIR /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/admin/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
