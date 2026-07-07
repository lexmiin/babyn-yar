FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable pnpm && corepack install -g pnpm@11.10.0

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN pnpm add -g turbo@2.10.3
COPY . .
RUN turbo prune admin --docker

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

FROM nginx:1.24-alpine AS runtime

WORKDIR /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/admin/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
