#!/usr/bin/env bash
# Purge Cloudflare's cached HTML. Requires CLOUDFLARE_ZONE_ID and
# CLOUDFLARE_API_TOKEN in the environment.
set -euo pipefail

: "${CLOUDFLARE_ZONE_ID:?CLOUDFLARE_ZONE_ID is required}"
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"

curl --silent --show-error --fail-with-body \
  --request POST \
  "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  --header "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  --json '{"tags":["babynyar-html"]}' |
  jq -e '.success == true' >/dev/null
