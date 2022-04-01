#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

// @ts-check
const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const prompts = require('prompts')
const execa = require('execa')
const chalk = require('chalk')
const { version } = require('./package.json')

const cwd = process.cwd()

const renameFiles = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
}

async function init() {
  console.log()
  console.log(`  ${chalk.bold('🌌 Valaxy')}  ${chalk.blue(`v${version}`)}`)
  console.log()

  let targetDir = argv._[0]
  if (!targetDir) {
    /**
     * @type {{ projectName: string }}
     */
    const { projectName } = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'valaxy-blog',
    })
    targetDir = projectName.trim()

    const packageName = await getValidPackageName(targetDir)
    const root = path.join(cwd, targetDir)

    if (fs.existsSync(root)) { fs.mkdirSync(root, { recursive: true }) }
    else {
      const existing = fs.readdirSync(root)
      if (existing.length) {
        console.log(chalk.yellow(`  Target directory "${targetDir}" is not empty.`))
        /**
       * @type {{ yes: boolean }}
       */
        const { yes } = await prompts({
          type: 'confirm',
          name: 'yes',
          initial: 'Y',
          message: 'Remove existing files and continue?',
        })
        if (yes)
          emptyDir(root)

        else
          return
      }
    }

    console.log(chalk.dim('  Scaffolding project in ') + targetDir + chalk.dim(' ...'))

    const templateDir = path.join(__dirname, 'template')
    const write = (file, content) => {
      const targetPath = renameFiles[file]
        ? path.join(root, renameFiles[file])
        : path.join(root, file)
      if (content)
        fs.writeFileSync(targetPath, content)

      else
        copy(path.join(templateDir, file), targetPath)
    }
  }
}

async function getValidPackageName(projectName) {
  projectName = path.basename(projectName)
  const packageNameRegExp = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
  if (packageNameRegExp.test(projectName)) {
    return projectName
  }
  else {
    const suggestedPackageName = projectName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/^[._]/, '')
      .replace(/[^a-z0-9-~]+/g, '-')

    /**
     * @type {{ inputPackageName: string }}
     */
    const { inputPackageName } = await prompts({
      type: 'text',
      name: 'inputPackageName',
      message: 'Package name:',
      initial: suggestedPackageName,
      validate: input =>
        packageNameRegExp.test(input) ? true : 'Invalid package.json name',
    })
    return inputPackageName
  }
}

function emptyDir(dir) {
  if (!fs.existsSync(dir))
    return

  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file)
    // baseline is Node 12 so can't use rmSync :(
    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs)
      fs.rmdirSync(abs)
    }
    else {
      fs.unlinkSync(abs)
    }
  }
}

init().catch((e) => {
  console.error(e)
})
