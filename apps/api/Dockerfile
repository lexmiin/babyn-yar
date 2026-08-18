FROM golang:1.26.6-alpine@sha256:3889b425f035be855a72fb4755265311293b6d414521f0a519d819df32222d83 AS builder

WORKDIR /app

COPY apps/api/go.mod apps/api/go.sum ./
RUN --mount=type=cache,id=go-mod,target=/go/pkg/mod \
  go mod download

COPY apps/api/cmd/api ./cmd/api
COPY apps/api/internal ./internal

RUN --mount=type=cache,id=go-build,target=/root/.cache/go-build \
  --mount=type=cache,id=go-mod,target=/go/pkg/mod \
  CGO_ENABLED=0 GOOS=linux go build -o=./api ./cmd/api

FROM alpine:3.24.1@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

RUN apk --no-cache add curl

WORKDIR /app

COPY --from=builder /app/api ./api

EXPOSE 8000

ENTRYPOINT [ "./api" ]
