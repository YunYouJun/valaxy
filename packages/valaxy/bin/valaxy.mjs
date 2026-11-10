#!/usr/bin/env node
'use strict'

import process from 'node:process'
import { ensureGrayMatterRedirect } from '../vendor/ensure-gray-matter.mjs'

async function main() {
  // gray-matter 4 crashes at import when js-yaml 5 is resolved. Install the
  // redirect before the CLI graph loads @mdit-vue/plugin-frontmatter.
  await ensureGrayMatterRedirect()
  const { run } = await import('../dist/node/cli/index.mjs')
  await run()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
