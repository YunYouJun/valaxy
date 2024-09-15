import process from 'node:process'
// import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import consola from 'consola'
import { $ } from 'zx'
import pc from 'picocolors'
import minimist from 'minimist'
import { versionBump } from 'bumpp'
import { packages, updateTemplateVersions } from './utils'

const { cyan, gray, yellow } = pc

const args = minimist(process.argv.slice(2))
export const isDryRun = !!args.dry

const pkgPaths = packages.map(name => `packages/${name}/package.json`)

async function main() {
  // const require = createRequire(import.meta.url)
  // require for avoid bumpp mjs bundle error
  // `import { ReleaseType } from "semver";`
  // ReleaseType is a type, not a value
  // TODO: create a PR to fix this
  // const { versionBump } = require('bumpp')
  const { newVersion } = await versionBump({
    commit: false,
    push: false,
    tag: false,

    files: [
      'package.json',

      ...pkgPaths,
    ],
  })

  console.log()
  consola.info('Updating packages version...')
  pkgPaths.forEach((pkgPath) => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    consola.info(`${cyan(pkg.name)} ${gray(`v${pkg.version}`)} -> ${yellow(`v${newVersion}`)}`)
  })

  console.log()
  consola.info(`Updating template version...`)
  await updateTemplateVersions(newVersion)

  if (!isDryRun) {
    console.log()
    consola.info('Committing changes...')
    console.log()
    await $`git add -A`
    await $`git commit -m "release: v${newVersion}"`
    await $`git tag v${newVersion}`

    console.log()
    consola.info('Pushing to GitHub...')
    console.log()
    await $`git push`
    await $`git push origin --tags`
  }
}

main().catch((e) => {
  console.log(e)
})
