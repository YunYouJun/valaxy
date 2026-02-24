// build docs in cloudflare, we need --depth=0, but cloudflare doesn't support custom
import { $ } from 'zx'

async function main() {
  await $`pnpm i`
  // get full history
  await $`git fetch --unshallow || true`
  $.env.NODE_OPTIONS = '--max-old-space-size=4096'
  await $`npm run build`
  await $`npm run build:docs`
}

main()
