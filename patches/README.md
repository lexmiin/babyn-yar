# Dependency patches

`nuqs-svelte@1.2.2.patch` adapts the SvelteKit adapter to Kit 3: `$app/env`,
`goto` for shallow updates, and the `replace`/`reset` navigation options. It
reads `page.shallow.url` when present so back/forward navigation restores the
correct query state, and preserves `page.state` when updating query parameters.

The admin app pins this dependency to `1.2.2`, and Renovate updates for it are
disabled while the patch is needed. PNPM applies the patch during
installation, including in the pruned Docker build. Remove the patch and its
`patchedDependencies` entry and the Renovate rule when upgrading to an upstream
release that supports Kit 3, then verify URL filters, browser history, focus,
and scrolling.
