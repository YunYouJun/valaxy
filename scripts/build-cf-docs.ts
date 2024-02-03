// build docs in cloudflare, we need --depth=0, but cloudflare doesn't support custom

import fs from 'node:fs'
import { $, cd } from 'zx'
import valaxyPkg from '../package.json'

async function main() {
  // get full history
  if (!fs.existsSync('valaxy'))
    await $`git clone ${valaxyPkg.repository}`

  cd('valaxy')
  await $`pnpm i`
  await $`npm run build && npm run build:docs`

  cd('..')
  // copy valaxy/docs/dist to docs/dist
  await $`cp -r valaxy/docs/dist docs/dist`
}

main()
