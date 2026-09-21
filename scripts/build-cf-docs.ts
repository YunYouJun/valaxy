// build docs in cloudflare, we need --depth=0, but cloudflare doesn't support custom
import { $ } from 'zx'

async function main() {
  await $`pnpm install --frozen-lockfile`
  // get full history
  await $`git fetch --unshallow || true`
  // Leave room for native allocations within the 4 GiB build budget.
  // Core declaration generation needs more heap than documentation rendering.
  $.env.NODE_OPTIONS = '--max-old-space-size=3072'
  await $`pnpm run build`
  $.env.NODE_OPTIONS = '--max-old-space-size=1536'
  await $`node scripts/measure-docs-build.mjs test-results/docs-build docs:build`
  await $`pnpm run verify:api`
}

main()
