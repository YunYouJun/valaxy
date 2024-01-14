import process from 'node:process'
import { yellow } from 'kolorist'
import consola from 'consola'
import { $ } from 'zx'

import { versionBump } from 'bumpp'

import minimist from 'minimist'
import { packages, updateTemplateVersions } from './utils'

const args = minimist(process.argv.slice(2))
export const isDryRun = !!args.dry

async function main() {
  const { newVersion } = await versionBump({
    commit: false,
    push: false,
    tag: false,

    files: [
      'package.json',

      ...packages.map(name => `packages/${name}/package.json`),
    ],
  })

  console.log()
  consola.info(`Updating template version to ${yellow(newVersion)}...`)
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
