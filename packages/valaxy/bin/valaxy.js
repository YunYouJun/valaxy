#!/usr/bin/env node
'use strict'
/* eslint-disable @typescript-eslint/no-var-requires */
// const path = require('path')

function main() {
  const { run } = require('../dist/cli')
  run()
}

main()
