// build docs in cloudflare, we need --depth=0, but cloudflare doesn't support custom
import { $ } from 'zx'

async function main() {
  await $`pnpm install --frozen-lockfile`
  // get full history
  await $`git fetch --unshallow || true`
  $.env.NODE_OPTIONS = '--max-old-space-size=4096'
  await $`pnpm run build`
  await $`node scripts/measure-docs-build.mjs test-results/docs-build docs:build`
  await $`pnpm run verify:api`
}

main()
