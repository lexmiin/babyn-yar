import { execFile } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const OXFMT_BIN = fileURLToPath(
  new URL('bin/oxfmt', import.meta.resolve('oxfmt/package.json'))
)

// Runs the CLI rather than the `format` API so the root config, including
// per-app overrides, applies exactly as it does for `pnpm format`.
export async function formatFile(path) {
  await promisify(execFile)(process.execPath, [OXFMT_BIN, path])
}
