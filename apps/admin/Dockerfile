FROM node:24.22.1-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS base
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

FROM nginx:1.31.8-alpine@sha256:e2d97c2b8c016f12c2f1a27d095685063b2f281c4edf2babfde6001cf4fb77a8 AS runtime

WORKDIR /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/admin/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
