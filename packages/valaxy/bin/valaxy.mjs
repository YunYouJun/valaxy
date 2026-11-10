#!/usr/bin/env node
'use strict'

import process from 'node:process'
import { run } from '../dist/node/cli/index.mjs'

async function main() {
  await run()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
