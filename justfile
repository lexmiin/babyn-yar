set default-list

api_dir := "apps/api"
main_package := "./cmd/api"
binary := "api"

help:
    @just --list

[working-directory(api_dir)]
tidy:
    go fmt ./...
    go mod tidy -v

[working-directory(api_dir)]
audit:
    go mod verify
    go vet ./...
    staticcheck -checks=all,-ST1000,-U1000 ./...
    govulncheck ./...

[working-directory(api_dir)]
test:
    MIGRATIONS_DIR={{ justfile_dir() }}/migrations go test -race -buildvcs ./...

[working-directory(api_dir)]
build:
    go build -o=./bin/{{ binary }} {{ main_package }}

[working-directory(api_dir)]
run: build
    ./bin/{{ binary }}

[working-directory(api_dir)]
dev:
    @air --build.cmd "just build" \
        --build.entrypoint "./bin/{{ binary }}" \
        --build.delay "100" \
        --build.include_dir "internal,cmd" \
        --misc.clean_on_exit "true"

psql:
    @docker compose -f docker-compose.dev.yml exec db psql $DATABASE_URL

docker-up:
    docker compose -f docker-compose.dev.yml up --detach

docker-down:
    docker compose -f docker-compose.dev.yml down

migrations-new name:
    @echo 'Creating migration files for {{ name }}'
    migrate create -seq -ext=.sql -dir=migrations {{ name }}

[confirm("Are you sure you want to apply migration?")]
migrations-up:
    @echo 'Running migrations...'
    migrate -path migrations -database $DATABASE_URL up

remote-setup user host:
    ssh {{ user }}@{{ host }} 'mkdir -p /home/{{ user }}/babyn-yar'
    just remote-sync {{ user }} {{ host }}

# Sync production secrets to the server's .env. Compose, Caddy, and migrations
# ship with each deploy; restart with `just deploy-production` to apply.
remote-sync user host:
    #!/usr/bin/env bash
    set -euo pipefail
    # Export before touching the server so a failed decryption can't clobber the remote .env.
    env_file="$(fnox --if-missing error export --profile production)"
    printf '%s\n' "$env_file" | ssh {{ user }}@{{ host }} 'cat > /home/{{ user }}/babyn-yar/.env && chmod 600 /home/{{ user }}/babyn-yar/.env'

# Release origin/main; the release workflow builds, publishes, and deploys it.
release:
    #!/usr/bin/env bash
    set -euo pipefail

    # A release started while another is queued would replace the queued one,
    # leaving its tag without images.
    active="$(gh run list --workflow release.yaml --limit 20 --json status --jq '[.[] | select(.status != "completed")] | length')"
    if [[ "$active" -ne 0 ]]; then
        echo "A release run is still in progress; wait for it to finish." >&2
        exit 1
    fi

    # Same format as the check in .github/workflows/release.yaml.
    base="v$(date -u +%Y.%m.%d)"
    existing="$(gh api "repos/{owner}/{repo}/git/matching-refs/tags/${base}" --jq '.[].ref | sub("^refs/tags/"; "")')"
    version="$base"
    n=0
    while grep -qxF "$version" <<<"$existing"; do
        n=$((n + 1))
        version="${base}.${n}"
    done

    # Pin the release to the commit shown, even if main moves during the prompt.
    read -r sha subject < <(gh api 'repos/{owner}/{repo}/commits/main' --jq '.sha + " " + (.commit.message | split("\n")[0])')
    echo "Release $version from origin main: ${sha:0:12} $subject"
    read -r -p "Continue? [y/N] " answer
    [[ "$answer" == [yY] ]] || exit 1

    gh release create "$version" --target "$sha" --title "$version" --generate-notes

# Deploy an existing release from this machine (fallback for the deploy
# workflow). Uses the files at the release tag, not the working copy.
[confirm("Are you sure you want to deploy to production?")]
remote-deploy user host tag:
    #!/usr/bin/env bash
    set -euo pipefail
    src="$(mktemp -d)"
    trap 'rm -rf "$src"' EXIT
    gh api "repos/{owner}/{repo}/tarball/refs/tags/{{ tag }}" | tar -xz -C "$src" --strip-components=1
    "$src/scripts/deploy.sh" {{ user }}@{{ host }} {{ tag }}

db-tunnel user host port="5432":
    -ssh -N -L {{ port }}:127.0.0.1:5432 {{ user }}@{{ host }}

[confirm("Are you sure you want to sync local db with prod?")]
db-sync remote="babynyar" bucket="db-backup":
    #!/usr/bin/env bash
    set -euo pipefail

    backup_dir="./backup"
    mkdir -p "$backup_dir"

    latest="$(rclone lsjson {{ remote }}:{{ bucket }} --recursive | jq -r 'sort_by(.ModTime) | last | .Path')"

    if [[ -z "$latest" || "$latest" == "null" ]]; then
        echo "No backups found in {{ remote }}:{{ bucket }}" >&2
        exit 1
    fi

    backup_path="$backup_dir/$latest"
    dump_path="$backup_dir/dump.sql"

    rclone copyto "{{ remote }}:{{ bucket }}/$latest" "$backup_path"
    case "$latest" in
        # The backup service uploads the dump as the only file in a tar archive.
        *.tar.gz) tar -xzOf "$backup_path" > "$dump_path" ;;
        # Older backups are a bare gzipped dump.
        *) gunzip -c "$backup_path" > "$dump_path" ;;
    esac
    docker compose -f docker-compose.dev.yml exec -T db psql -U postgres -d postgres < "$dump_path"

deploy-production user host tag:
    just remote-deploy {{ user }} {{ host }} {{ tag }}
    just purge-cdn-cache

purge-cdn-cache:
    fnox --if-missing error exec --profile production -- ./scripts/purge-cdn-cache.sh
