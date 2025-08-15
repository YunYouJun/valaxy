// build docs in cloudflare, we need --depth=0, but cloudflare doesn't support custom
import { $ } from 'zx'

async function main() {
  await $`pnpm i`
  // get full history
  await $`git fetch --unshallow || true`
  await $`npm run build && npm run build:docs`
}

main()
