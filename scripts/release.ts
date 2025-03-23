// import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { versionBump } from 'bumpp'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import minimist from 'minimist'
import { $ } from 'zx'
import { packages, updateTemplateVersions } from './utils'

const args = minimist(process.argv.slice(2))
export const isDryRun = !!args.dry

const pkgPaths = packages.map(name => `packages/${name}/package.json`)

async function main() {
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
    consola.info(`${colors.cyan(pkg.name)} ${colors.gray(`v${pkg.version}`)} -> ${colors.yellow(`v${newVersion}`)}`)
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
