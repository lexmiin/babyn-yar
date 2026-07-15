## Commands

If a required executable is unavailable on `PATH`, run the command through the
development shell:

    nix develop -c <command>

- `just test` — run the API test suite in `./apps/api`.
- `just tidy` — run after modifying `./apps/api/go.mod` or `./apps/api/go.sum`.
