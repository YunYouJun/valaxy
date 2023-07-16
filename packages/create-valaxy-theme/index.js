#!/usr/bin/env node
/* eslint-disable no-console */

const process = require('node:process')

const argv = require('minimist')(process.argv.slice(2))
const prompts = require('prompts')
const execa = require('execa')
const { bold, blue, cyan, gray, green, yellow, dim } = require('kolorist')
const { version } = require('./package.json')

async function init() {
  console.log()
  console.log(`  ${bold('🌌 Valaxy')}  ${blue(`v${version}`)}`)
  console.log()

  let themeName = argv._[0]
  if (!themeName) {
    /**
     * @type {{ theme: string }}
     */
    const { theme } = await prompts({
      type: 'text',
      name: 'theme',
      message: 'Theme name: valaxy-theme-',
      initial: 'starter',
    })
    themeName = theme
  }

  const targetDir = `valaxy-theme-${themeName.trim()}`

  const starterRepo = 'https://github.com/YunYouJun/valaxy-theme-starter'
  console.log(`  ${dim('npx')} ${gray('degit')} ${blue(starterRepo)} ${yellow(targetDir)}`)
  await execa('npx', ['degit', starterRepo, targetDir], { stdio: 'inherit' })

  console.log()
  console.log(`  ${bold('Check it')}:`)
  console.log()
  console.log(`- Change ${bold('author')} name in ${yellow('LICENSE')} & ${green('package.json')} & ${blue('.github')}`)
  console.log(`- Change ${blue('valaxy.config.ts')} theme: ${yellow('starter')} to ${cyan(`${themeName}`)}`)
  console.log(`- Rename ${yellow(`valaxy-theme-${themeName}`)} to ${cyan(`valaxy-theme-${themeName}`)}`)
  console.log()
  console.log(`  ${cyan('✨')}`)
  console.log()
}

init().catch((e) => {
  console.error(e)
})
