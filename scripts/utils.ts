import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import type { ReleaseType } from 'semver'
import semver from 'semver'
import consola from 'consola'
import { cyan, gray, yellow } from 'kolorist'

export const packages = [
  'valaxy',
  'valaxy-theme-yun',
  'create-valaxy',
]

export const templates = [
  'packages/create-valaxy/template-blog',
]

export async function updateTemplateVersions(version: string) {
  for (const template of templates) {
    const pkgPath = join(template, 'package.json')
    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
    const deps = ['dependencies', 'devDependencies']
    for (const name of deps) {
      if (!pkg[name])
        continue

      for (const key in pkg[name]) {
        if (packages.includes(key)) {
          consola.info(`${cyan(key)} ${gray(`v${pkg[name][key]}`)} -> ${yellow(`v${version}`)}`)
          pkg[name][key] = version
        }
      }
    }
    await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  }
}

export async function updateVersion(pkgPath: string, version: string) {
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
  consola.info(`${cyan(pkg.name)} ${gray(`v${pkg.version}`)} -> ${yellow(`v${version}`)}`)
  pkg.version = version
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
}

export function getVersionChoices(currentVersion: string) {
  const currentBeta = currentVersion.includes('beta')

  const inc: (i: ReleaseType) => string = i =>
    semver.inc(currentVersion, i)!

  const versionChoices = [
    {
      title: 'next',
      value: inc(currentBeta ? 'prerelease' : 'patch'),
    },
    ...(currentBeta
      ? [
          {
            title: 'stable',
            value: inc('patch'),
          },
        ]
      : [
          {
            title: 'beta-minor',
            value: inc('preminor'),
          },
          {
            title: 'beta-major',
            value: inc('premajor'),
          },
          {
            title: 'minor',
            value: inc('minor'),
          },
          {
            title: 'major',
            value: inc('major'),
          },
        ]),
    { value: 'custom', title: 'custom' },
  ].map((i) => {
    i.title = `${i.title} (${i.value})`
    return i
  })

  return versionChoices
}
