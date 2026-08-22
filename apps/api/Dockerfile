FROM nixos/nix:2.34.8@sha256:1a711b619c8a713eff32c3f8d8781b3b4d0130cb91c0a57f67e87abfeeb90b01 AS builder

WORKDIR /build

COPY flake.nix flake.lock ./
COPY apps/api ./apps/api

RUN nix --extra-experimental-features "nix-command flakes" build .#api --out-link /tmp/result
RUN cp /tmp/result/bin/api /tmp/api

FROM alpine:3.24.1@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

WORKDIR /app

COPY --from=builder /tmp/api ./api

EXPOSE 8000

ENTRYPOINT ["./api"]
