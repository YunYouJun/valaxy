// build docs in cloudflare, we need --depth=0, but cloudflare doesn't support custom
import { $ } from 'zx'

async function main() {
  await $`pnpm i`
  // get full history
  await $`git fetch --unshallow || true`
  await $`export NODE_OPTIONS=--max-old-space-size=4096 && npm run build && npm run build:docs`
}

main()
