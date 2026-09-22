## Commands

If a required executable is unavailable on `PATH`, run the command through the
development shell:

    nix develop -c <command>

- `just test` — run the API test suite in `./apps/api`.
- `just tidy` — run after modifying `./apps/api/go.mod` or `./apps/api/go.sum`.

## Generated files

- Edit the source SVG or config, then rerun its generator instead of editing a
  generated file by hand. Verify the generated diff contains only intended changes.
- Do not consider a change to a generated file complete until regeneration succeeds.

## Testing

- Do not add a test merely because production code changed.
- Do not add tests for reversible, low-risk configuration or wiring changes when
  the test would mirror the implementation or test a dependency's documented
  behavior. Verify such changes with the existing relevant tests, build checks,
  or a focused smoke test.
- Add tests when they protect repository-owned logic, an edge or failure
  case, or when the user asks you to.
