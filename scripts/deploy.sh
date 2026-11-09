#!/usr/bin/env bash
# Deploy a release to the production server.
#
# Pins the app images in docker-compose.yml to the release tag, uploads the
# compose file, Caddyfile, migrations, and scripts/deploy-remote.sh, then runs
# that script on the server to migrate and restart the stack. The server's
# .env is managed separately (`just remote-sync`).
#
# Usage: scripts/deploy.sh <user@host> <tag>
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: $0 <user@host> <tag>" >&2
  exit 64
fi

target="$1"
tag="$2"
remote_dir="babyn-yar" # relative to the remote user's home

# Same format as the check in .github/workflows/release.yaml.
if [[ ! "$tag" =~ ^v[0-9]{4}\.[0-9]{2}\.[0-9]{2}(\.[0-9]+)?$ ]]; then
  echo "invalid release tag: $tag" >&2
  exit 64
fi

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

sed -E "s#(image: ghcr\.io/lexmiin/babyn-yar-(api|admin|gov)):latest\$#\1:${tag}#" \
  "$root/docker-compose.yml" >"$work/docker-compose.yml"

pinned="$(grep -cE "image: ghcr\.io/lexmiin/babyn-yar-(api|admin|gov):${tag//./\\.}\$" "$work/docker-compose.yml" || true)"
if [[ "$pinned" -ne 3 ]]; then
  echo "expected to pin 3 app images to $tag, pinned $pinned" >&2
  exit 1
fi

# The server keeps migration files from newer releases (see below), so
# migrate only up to this release's latest migration, never past it.
target_migration="$(
  find "$root/migrations" -name '*.up.sql' -exec basename {} \; |
    sed -E 's/^0*([0-9]+)_.*/\1/' | sort -n | tail -n 1
)"
target_migration="${target_migration:-0}"

# Upload into a staging directory unique to this deploy. deploy-remote.sh
# moves the files into place under a server-side lock, so concurrent deploys
# (workflow and `just remote-deploy`) never interleave.
stage=".deploy-staging/${tag}-$(date +%s)-$$"

# `ssh -n` keeps remote commands, docker included, off this script's stdin.
echo "==> uploading files for $tag"
ssh -n "$target" "mkdir -p $remote_dir/$stage"
rsync -az "$work/docker-compose.yml" "$root/scripts/deploy-remote.sh" "$target:$remote_dir/$stage/"
rsync -az "$root/caddy" "$root/migrations" "$target:$remote_dir/$stage/"

echo "==> migrating and restarting"
ssh -n "$target" "cd $remote_dir && sh $stage/deploy-remote.sh $stage $target_migration"

echo "==> deployed $tag"
