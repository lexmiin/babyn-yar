FROM golang:1.27.3-alpine@sha256:b8c9b82affbbb82a020bbcf998dad2ba9516944ac7e883524642a481a9505e9c AS builder

WORKDIR /app

COPY apps/api/go.mod apps/api/go.sum ./
RUN --mount=type=cache,id=go-mod,target=/go/pkg/mod \
  go mod download

COPY apps/api/cmd/api ./cmd/api
COPY apps/api/internal ./internal

RUN --mount=type=cache,id=go-build,target=/root/.cache/go-build \
  --mount=type=cache,id=go-mod,target=/go/pkg/mod \
  CGO_ENABLED=0 GOOS=linux go build -o=./api ./cmd/api

FROM alpine:3.24.2@sha256:294b683cb724975bec92580e1e685676bd4b50bda910ddb8c51d4cabeaec77e6

RUN apk --no-cache add curl

WORKDIR /app

COPY --from=builder /app/api ./api

EXPOSE 8000

ENTRYPOINT [ "./api" ]
