FROM node:22.23.1-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable pnpm && corepack install -g pnpm@11.10.0

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN pnpm add -g turbo@2.10.3
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

FROM nginx:1.30.4-alpine@sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46 AS runtime

WORKDIR /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/admin/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
