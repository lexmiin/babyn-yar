#!/bin/sh
# Runs on the production server from ~/babyn-yar; uploaded by scripts/deploy.sh.
# Under a lock shared by every deploy, moves the staged release files into
# place, migrates the database up to the release's latest migration, then
# restarts the stack on the pinned images.
#
# Usage: sh <stage>/deploy-remote.sh <stage> <target-migration>
set -eu

stage="$1"
target_migration="$2"
trap 'rm -rf "$stage"' EXIT

# Serialize deploys. Without this, a concurrent deploy could migrate past
# target_migration between the version check and `migrate goto`, and goto
# would then migrate down.
exec 9>.deploy.lock
if ! flock -w 600 9; then
  echo "another deploy still holds the lock after 10 minutes" >&2
  exit 1
fi

cp "$stage/docker-compose.yml" docker-compose.yml
mkdir -p caddy migrations
# cp overwrites existing files in place, so the Caddyfile's single-file bind
# mount sees the new content.
cp -R "$stage/caddy/." caddy/
# Never delete migrations: when rolling back to an older release, migrate
# still needs the file for the database's current, newer version.
cp -R "$stage/migrations/." migrations/

docker compose pull api admin gov

# `migrate version` prints "N", "N (dirty)", or "error: no migration".
current="$(docker compose --profile tools run --rm -T migrate version 2>&1 | tail -n 1)" || true
case "$current" in
  "error: no migration") current=0 ;;
  *dirty*)
    echo "database is dirty ($current); fix it manually" >&2
    exit 1
    ;;
  '' | *[!0-9]*)
    echo "unexpected migrate version output: $current" >&2
    exit 1
    ;;
esac

if [ "$current" -lt "$target_migration" ]; then
  echo "migrating $current -> $target_migration"
  docker compose --profile tools run --rm -T migrate goto "$target_migration"
else
  echo "database at $current, release needs $target_migration: nothing to apply"
fi

docker compose up -d --wait
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
